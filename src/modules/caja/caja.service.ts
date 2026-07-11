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
    const html = this.buildReporteHtml(reporte);
    return this.pdfService.htmlToPdf(html);
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

  private buildReporteHtml(reporte: any): string {
    const filasVentas = reporte.ventas
      .map(
        (v: any) => `
          <tr>
            <td>${v.numero}</td>
            <td>${v.estado}</td>
            <td style="text-align:right">${v.total.toFixed(2)}</td>
            <td>${v.pagos.map((p: any) => `${p.formaPago}: ${p.monto.toFixed(2)}`).join(', ')}</td>
          </tr>
        `,
      )
      .join('');

    const filasMovimientos = reporte.movimientos
      .map(
        (m: any) => `
          <tr>
            <td>${new Date(m.fecha).toLocaleString('es-EC')}</td>
            <td>${m.tipo}</td>
            <td>${m.concepto}</td>
            <td style="text-align:right">${m.monto.toFixed(2)}</td>
          </tr>
        `,
      )
      .join('');

    return `
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: Arial, sans-serif; font-size: 12px; color: #222; }
            h1 { font-size: 18px; margin-bottom: 4px; }
            h2 { font-size: 14px; margin-top: 20px; }
            .meta { color: #444; margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
            th, td { border: 1px solid #ccc; padding: 6px 8px; }
            th { background: #f2f2f2; text-align: left; }
            .totales td { border: none; padding: 2px 8px; }
          </style>
        </head>
        <body>
          <h1>Cierre de Caja — ${reporte.sucursal.nombre}</h1>
          <div class="meta">
            Apertura: ${new Date(reporte.fechaApertura).toLocaleString('es-EC')} (${reporte.usuarioApertura.nombres} ${reporte.usuarioApertura.apellidos})<br />
            ${reporte.fechaCierre ? `Cierre: ${new Date(reporte.fechaCierre).toLocaleString('es-EC')} (${reporte.usuarioCierre?.nombres ?? ''} ${reporte.usuarioCierre?.apellidos ?? ''})` : 'Caja aún abierta'}
          </div>

          <h2>Ventas</h2>
          <table>
            <thead><tr><th>Número</th><th>Estado</th><th>Total</th><th>Pagos</th></tr></thead>
            <tbody>${filasVentas || '<tr><td colspan="4">Sin ventas</td></tr>'}</tbody>
          </table>

          <h2>Movimientos manuales</h2>
          <table>
            <thead><tr><th>Fecha</th><th>Tipo</th><th>Concepto</th><th>Monto</th></tr></thead>
            <tbody>${filasMovimientos || '<tr><td colspan="4">Sin movimientos</td></tr>'}</tbody>
          </table>

          <h2>Arqueo</h2>
          <table class="totales" style="width:auto;">
            <tr><td>Monto inicial</td><td style="text-align:right">${reporte.montoInicial.toFixed(2)}</td></tr>
            <tr><td>Total efectivo</td><td style="text-align:right">${(reporte.totalEfectivo ?? 0).toFixed(2)}</td></tr>
            <tr><td>Total transferencia</td><td style="text-align:right">${(reporte.totalTransferencia ?? 0).toFixed(2)}</td></tr>
            <tr><td>Total tarjeta</td><td style="text-align:right">${(reporte.totalTarjeta ?? 0).toFixed(2)}</td></tr>
            <tr><td><strong>Monto esperado (efectivo)</strong></td><td style="text-align:right"><strong>${(reporte.montoEsperado ?? 0).toFixed(2)}</strong></td></tr>
            <tr><td>Monto contado</td><td style="text-align:right">${(reporte.montoContado ?? 0).toFixed(2)}</td></tr>
            <tr><td><strong>Diferencia</strong></td><td style="text-align:right"><strong>${(reporte.diferencia ?? 0).toFixed(2)}</strong></td></tr>
          </table>
        </body>
      </html>
    `;
  }
}
