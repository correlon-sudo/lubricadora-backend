import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Producto, RolUsuario } from '@prisma/client';
import { PrismaService } from '../../config/prisma.service';
import { PdfService } from '../pdf/pdf.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { FindProductosQueryDto } from './dto/find-productos.query.dto';

@Injectable()
export class ProductosService {
  constructor(
    private prisma: PrismaService,
    private pdfService: PdfService,
  ) {}

  async findAll(filters: FindProductosQueryDto, rol?: RolUsuario) {
    const where: Prisma.ProductoWhereInput = {
      activo: true,
      marcaId: filters.marcaId,
      categoriaId: filters.categoriaId,
      ...(filters.search && {
        OR: [
          { nombre: { contains: filters.search, mode: 'insensitive' } },
          { codigo: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
    };

    const productos = await this.prisma.producto.findMany({
      where,
      include: {
        marca: true,
        categoria: true,
        inventarios: filters.sucursalId
          ? { where: { sucursalId: filters.sucursalId } }
          : true,
      },
      orderBy: { nombre: 'asc' },
    });

    return productos.map((p) => this.serializar(p, rol));
  }

  async findOne(id: string, rol?: RolUsuario) {
    const producto = await this.prisma.producto.findUnique({
      where: { id },
      include: { marca: true, categoria: true, inventarios: true },
    });
    if (!producto) throw new NotFoundException('Producto no encontrado');
    return this.serializar(producto, rol);
  }

  async stockBajo() {
    const inventarios = await this.prisma.inventarioSucursal.findMany({
      include: { producto: true, sucursal: true },
    });

    return inventarios
      .filter((i) => i.cantidad < (i.stockMinimo ?? i.producto.stockMinimo))
      .map((i) => ({
        productoId: i.productoId,
        productoCodigo: i.producto.codigo,
        productoNombre: i.producto.nombre,
        sucursalId: i.sucursalId,
        sucursalNombre: i.sucursal.nombre,
        cantidad: i.cantidad,
        minimo: i.stockMinimo ?? i.producto.stockMinimo,
      }));
  }

  async create(dto: CreateProductoDto) {
    const existente = await this.prisma.producto.findUnique({
      where: { codigo: dto.codigo },
    });
    if (existente) {
      throw new ConflictException('Ya existe un producto con ese código');
    }

    const producto = await this.prisma.producto.create({
      data: dto,
      include: { marca: true, categoria: true, inventarios: true },
    });
    return this.serializar(producto);
  }

  async update(id: string, dto: UpdateProductoDto) {
    await this.findOne(id);
    const producto = await this.prisma.producto.update({
      where: { id },
      data: dto,
      include: { marca: true, categoria: true, inventarios: true },
    });
    return this.serializar(producto);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.producto.update({ where: { id }, data: { activo: false } });
    return { success: true };
  }

  async reportePdf(filters: FindProductosQueryDto) {
    const productos = await this.findAll(filters);
    const doc = this.pdfService.crear();
    this.dibujarReporteProductos(doc, productos);
    return this.pdfService.aBuffer(doc);
  }

  private dibujarReporteProductos(
    doc: PDFKit.PDFDocument,
    productos: Awaited<ReturnType<ProductosService['findAll']>>,
  ): void {
    doc.fontSize(16).font('Helvetica-Bold').text('Reporte de Inventario');
    doc.moveDown(0.3);
    doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor('#666')
      .text(`Generado: ${new Date().toLocaleString('es-EC')}`);
    doc.fillColor('#000');
    doc.moveDown(1);

    const filas = productos.map((p) => [
      p.codigo,
      p.nombre,
      p.marca.nombre,
      p.categoria.nombre,
      p.precioVenta.toFixed(2),
      String(p.stockTotal),
    ]);
    this.pdfService.dibujarTabla(
      doc,
      40,
      doc.y,
      [
        { titulo: 'Código', ancho: 70 },
        { titulo: 'Nombre', ancho: 160 },
        { titulo: 'Marca', ancho: 90 },
        { titulo: 'Categoría', ancho: 90 },
        { titulo: 'Precio venta', ancho: 60, align: 'right' },
        { titulo: 'Stock', ancho: 45, align: 'right' },
      ],
      filas,
    );
  }

  // Prisma serializa Decimal como string en JSON — normalizamos a number
  // (mismo gotcha que configuracion.porcentajeIva).
  private serializar(
    producto: Producto & {
      marca: { id: string; nombre: string };
      categoria: { id: string; nombre: string };
      inventarios: { sucursalId: string; cantidad: number }[];
    },
    rol?: RolUsuario,
  ) {
    const base = {
      ...producto,
      precioCosto: Number(producto.precioCosto),
      precioVenta: Number(producto.precioVenta),
      stockTotal: producto.inventarios.reduce((sum, i) => sum + i.cantidad, 0),
    };

    // VENDEDOR tiene solo consulta (matriz de permisos) — no debe ver el
    // margen de ganancia, ni siquiera inspeccionando la respuesta HTTP cruda.
    if (rol === RolUsuario.VENDEDOR) {
      const { precioCosto, ...sinCosto } = base;
      return sinCosto;
    }
    return base;
  }
}
