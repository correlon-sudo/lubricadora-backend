import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../config/prisma.service';
import { PdfService } from '../pdf/pdf.service';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { AbrirCajaDto } from './dto/abrir-caja.dto';
import { CerrarCajaDto } from './dto/cerrar-caja.dto';
import { MovimientoCajaDto } from './dto/movimiento-caja.dto';

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

const INCLUDE_CAJA = {
  sucursal: true,
  usuarioApertura: { select: { nombres: true, apellidos: true } },
  usuarioCierre: { select: { nombres: true, apellidos: true } },
} satisfies Prisma.CajaInclude;

@Injectable()
export class CajaService {
  constructor(
    private prisma: PrismaService,
    private pdfService: PdfService,
    private auditoriaService: AuditoriaService,
  ) {}

  async abrir(sucursalId: string, usuarioId: string, dto: AbrirCajaDto, ip?: string) {
    const existente = await this.prisma.caja.findFirst({
      where: { sucursalId, estado: 'ABIERTA' },
    });
    if (existente) {
      throw new ConflictException('Ya hay una caja abierta en esta sucursal');
    }

    const caja = await this.prisma.caja.create({
      data: {
        sucursalId,
        usuarioAperturaId: usuarioId,
        montoInicial: dto.montoInicial,
      },
      include: INCLUDE_CAJA,
    });

    await this.auditoriaService.registrar({
      usuarioId,
      accion: 'ABRIR',
      entidad: 'caja',
      entidadId: caja.id,
      detalle: { sucursalId, montoInicial: Number(caja.montoInicial) },
      ip,
    });

    return this.serializar(caja);
  }

  async actual(sucursalId: string) {
    const caja = await this.prisma.caja.findFirst({
      where: { sucursalId, estado: 'ABIERTA' },
      include: INCLUDE_CAJA,
    });
    if (!caja) throw new NotFoundException('No hay caja abierta en esta sucursal');
    return this.serializar(caja);
  }

  async cerrar(id: string, usuarioId: string, dto: CerrarCajaDto, ip?: string) {
    const caja = await this.prisma.caja.findUnique({ where: { id } });
    if (!caja) throw new NotFoundException('Caja no encontrada');
    if (caja.estado === 'CERRADA') {
      throw new BadRequestException('La caja ya está cerrada');
    }

    const ventas = await this.prisma.venta.findMany({
      where: { cajaId: id, estado: 'EMITIDA' },
      include: { pagos: true },
    });

    let totalEfectivo = 0;
    let totalTransferencia = 0;
    let totalTarjeta = 0;
    for (const venta of ventas) {
      for (const pago of venta.pagos) {
        const monto = Number(pago.monto);
        if (pago.formaPago === 'EFECTIVO') totalEfectivo += monto;
        else if (pago.formaPago === 'TRANSFERENCIA') totalTransferencia += monto;
        else totalTarjeta += monto;
      }
    }

    const movimientos = await this.prisma.movimientoCaja.findMany({
      where: { cajaId: id },
    });
    const ingresos = movimientos
      .filter((m) => m.tipo === 'INGRESO')
      .reduce((s, m) => s + Number(m.monto), 0);
    const egresos = movimientos
      .filter((m) => m.tipo === 'EGRESO')
      .reduce((s, m) => s + Number(m.monto), 0);

    // Solo el efectivo (ventas + movimientos manuales) afecta el dinero
    // físico esperado en el cajón; transferencia/tarjeta no.
    const montoEsperado = round2(
      Number(caja.montoInicial) + totalEfectivo + ingresos - egresos,
    );
    const diferencia = round2(dto.montoContado - montoEsperado);

    const actualizada = await this.prisma.caja.update({
      where: { id },
      data: {
        estado: 'CERRADA',
        fechaCierre: new Date(),
        usuarioCierreId: usuarioId,
        totalEfectivo: round2(totalEfectivo),
        totalTransferencia: round2(totalTransferencia),
        totalTarjeta: round2(totalTarjeta),
        montoEsperado,
        montoContado: dto.montoContado,
        diferencia,
        observacion: dto.observacion,
      },
      include: INCLUDE_CAJA,
    });

    await this.auditoriaService.registrar({
      usuarioId,
      accion: 'CERRAR',
      entidad: 'caja',
      entidadId: caja.id,
      detalle: { montoContado: dto.montoContado, montoEsperado, diferencia },
      ip,
    });

    return this.serializar(actualizada);
  }

  async movimiento(id: string, usuarioId: string, dto: MovimientoCajaDto, ip?: string) {
    const caja = await this.prisma.caja.findUnique({ where: { id } });
    if (!caja) throw new NotFoundException('Caja no encontrada');
    if (caja.estado !== 'ABIERTA') {
      throw new BadRequestException('La caja no está abierta');
    }

    const movimiento = await this.prisma.movimientoCaja.create({
      data: {
        cajaId: id,
        tipo: dto.tipo,
        monto: dto.monto,
        concepto: dto.concepto,
        usuarioId,
      },
    });

    await this.auditoriaService.registrar({
      usuarioId,
      accion: dto.tipo,
      entidad: 'movimientoCaja',
      entidadId: movimiento.id,
      detalle: { cajaId: id, monto: Number(movimiento.monto), concepto: dto.concepto },
      ip,
    });

    return { ...movimiento, monto: Number(movimiento.monto) };
  }

  async historial(sucursalId?: string) {
    const cajas = await this.prisma.caja.findMany({
      where: sucursalId ? { sucursalId } : undefined,
      include: INCLUDE_CAJA,
      orderBy: { fechaApertura: 'desc' },
    });
    return cajas.map((c) => this.serializar(c));
  }

  async reporteDiario(id: string) {
    const caja = await this.prisma.caja.findUnique({
      where: { id },
      include: {
        ...INCLUDE_CAJA,
        ventas: { include: { pagos: true } },
        movimientos: true,
      },
    });
    if (!caja) throw new NotFoundException('Caja no encontrada');

    return {
      ...this.serializar(caja),
      ventas: caja.ventas.map((v) => ({
        numero: v.numero,
        total: Number(v.total),
        estado: v.estado,
        pagos: v.pagos.map((p) => ({ formaPago: p.formaPago, monto: Number(p.monto) })),
      })),
      movimientos: caja.movimientos.map((m) => ({
        tipo: m.tipo,
        monto: Number(m.monto),
        concepto: m.concepto,
        fecha: m.fecha,
      })),
    };
  }

  async reportePdf(id: string) {
    const reporte = await this.reporteDiario(id);
    const doc = this.pdfService.crear();
    this.dibujarReporteCierre(doc, reporte);
    return this.pdfService.aBuffer(doc);
  }

  private serializar(caja: {
    montoInicial: Prisma.Decimal;
    totalEfectivo: Prisma.Decimal | null;
    totalTransferencia: Prisma.Decimal | null;
    totalTarjeta: Prisma.Decimal | null;
    montoEsperado: Prisma.Decimal | null;
    montoContado: Prisma.Decimal | null;
    diferencia: Prisma.Decimal | null;
    [key: string]: unknown;
  }) {
    const num = (v: Prisma.Decimal | null) => (v === null ? null : Number(v));
    return {
      ...caja,
      montoInicial: Number(caja.montoInicial),
      totalEfectivo: num(caja.totalEfectivo),
      totalTransferencia: num(caja.totalTransferencia),
      totalTarjeta: num(caja.totalTarjeta),
      montoEsperado: num(caja.montoEsperado),
      montoContado: num(caja.montoContado),
      diferencia: num(caja.diferencia),
    };
  }

  private dibujarReporteCierre(doc: PDFKit.PDFDocument, reporte: any): void {
    doc.fontSize(16).font('Helvetica-Bold').text(`Cierre de Caja — ${reporte.sucursal.nombre}`);
    doc.moveDown(0.3);
    doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor('#444')
      .text(
        `Apertura: ${new Date(reporte.fechaApertura).toLocaleString('es-EC')} (${reporte.usuarioApertura.nombres} ${reporte.usuarioApertura.apellidos})`,
      );
    doc.text(
      reporte.fechaCierre
        ? `Cierre: ${new Date(reporte.fechaCierre).toLocaleString('es-EC')} (${reporte.usuarioCierre?.nombres ?? ''} ${reporte.usuarioCierre?.apellidos ?? ''})`
        : 'Caja aún abierta',
    );
    doc.fillColor('#000');
    doc.moveDown(1);

    doc.fontSize(12).font('Helvetica-Bold').text('Ventas');
    doc.moveDown(0.3);
    if (reporte.ventas.length) {
      const filasVentas = reporte.ventas.map((v: any) => [
        v.numero,
        v.estado,
        v.total.toFixed(2),
        v.pagos.map((p: any) => `${p.formaPago}: ${p.monto.toFixed(2)}`).join(', '),
      ]);
      doc.y = this.pdfService.dibujarTabla(
        doc,
        40,
        doc.y,
        [
          { titulo: 'Número', ancho: 90 },
          { titulo: 'Estado', ancho: 70 },
          { titulo: 'Total', ancho: 70, align: 'right' },
          { titulo: 'Pagos', ancho: 220 },
        ],
        filasVentas,
      );
    } else {
      doc.fontSize(9).font('Helvetica').text('Sin ventas');
    }
    doc.moveDown(1);

    doc.fontSize(12).font('Helvetica-Bold').text('Movimientos manuales');
    doc.moveDown(0.3);
    if (reporte.movimientos.length) {
      const filasMovimientos = reporte.movimientos.map((m: any) => [
        new Date(m.fecha).toLocaleString('es-EC'),
        m.tipo,
        m.concepto,
        m.monto.toFixed(2),
      ]);
      doc.y = this.pdfService.dibujarTabla(
        doc,
        40,
        doc.y,
        [
          { titulo: 'Fecha', ancho: 120 },
          { titulo: 'Tipo', ancho: 70 },
          { titulo: 'Concepto', ancho: 190 },
          { titulo: 'Monto', ancho: 70, align: 'right' },
        ],
        filasMovimientos,
      );
    } else {
      doc.fontSize(9).font('Helvetica').text('Sin movimientos');
    }
    doc.moveDown(1);

    doc.fontSize(12).font('Helvetica-Bold').text('Arqueo');
    doc.moveDown(0.3);
    doc.fontSize(9).font('Helvetica');
    doc.text(`Monto inicial: ${reporte.montoInicial.toFixed(2)}`);
    doc.text(`Total efectivo: ${(reporte.totalEfectivo ?? 0).toFixed(2)}`);
    doc.text(`Total transferencia: ${(reporte.totalTransferencia ?? 0).toFixed(2)}`);
    doc.text(`Total tarjeta: ${(reporte.totalTarjeta ?? 0).toFixed(2)}`);
    doc.font('Helvetica-Bold').text(`Monto esperado (efectivo): ${(reporte.montoEsperado ?? 0).toFixed(2)}`);
    doc.font('Helvetica').text(`Monto contado: ${(reporte.montoContado ?? 0).toFixed(2)}`);
    doc.font('Helvetica-Bold').text(`Diferencia: ${(reporte.diferencia ?? 0).toFixed(2)}`);
  }
}
