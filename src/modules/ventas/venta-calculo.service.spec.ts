import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../config/prisma.service';
import { VentaCalculoService } from './venta-calculo.service';
import { VentaItemDto } from './dto/venta-item.dto';

type MockPrisma = {
  configuracion: { findFirst: jest.Mock };
  producto: { findUnique: jest.Mock };
  servicio: { findUnique: jest.Mock };
};

const PRODUCTO_CON_IVA = {
  id: 'prod-1',
  nombre: 'Aceite 20W50',
  precioVenta: 12.99,
  ivaAplicable: true,
  activo: true,
};

const PRODUCTO_SIN_IVA = {
  id: 'prod-2',
  nombre: 'Mano de obra exenta',
  precioVenta: 20,
  ivaAplicable: false,
  activo: true,
};

const SERVICIO_CON_IVA = {
  id: 'serv-1',
  nombre: 'Cambio de aceite',
  precio: 8,
  ivaAplicable: true,
  activo: true,
};

function item(overrides: Partial<VentaItemDto>): VentaItemDto {
  return {
    tipoItem: 'PRODUCTO',
    cantidad: 1,
    ...overrides,
  } as VentaItemDto;
}

describe('VentaCalculoService', () => {
  let service: VentaCalculoService;
  let prisma: MockPrisma;

  beforeEach(async () => {
    prisma = {
      configuracion: { findFirst: jest.fn().mockResolvedValue({ porcentajeIva: 15 }) },
      producto: { findUnique: jest.fn() },
      servicio: { findUnique: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [VentaCalculoService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(VentaCalculoService);
  });

  it('rechaza una venta sin ítems', async () => {
    await expect(service.calcular([])).rejects.toThrow(BadRequestException);
  });

  it('calcula subtotal, iva y total para un producto con IVA', async () => {
    prisma.producto.findUnique.mockResolvedValue(PRODUCTO_CON_IVA);

    const resultado = await service.calcular([
      item({ tipoItem: 'PRODUCTO', productoId: 'prod-1', cantidad: 2 }),
    ]);

    // 12.99 * 2 = 25.98 subtotal; IVA 15% = 3.90 (round2)
    expect(resultado.subtotal).toBe(25.98);
    expect(resultado.iva).toBe(3.9);
    expect(resultado.total).toBe(29.88);
    expect(resultado.items[0].ivaPorcentaje).toBe(15);
  });

  it('no aplica IVA a un producto exento', async () => {
    prisma.producto.findUnique.mockResolvedValue(PRODUCTO_SIN_IVA);

    const resultado = await service.calcular([
      item({ tipoItem: 'PRODUCTO', productoId: 'prod-2' }),
    ]);

    expect(resultado.iva).toBe(0);
    expect(resultado.total).toBe(20);
    expect(resultado.items[0].ivaPorcentaje).toBe(0);
  });

  it('combina productos y servicios en la misma venta', async () => {
    prisma.producto.findUnique.mockResolvedValue(PRODUCTO_CON_IVA);
    prisma.servicio.findUnique.mockResolvedValue(SERVICIO_CON_IVA);

    const resultado = await service.calcular([
      item({ tipoItem: 'PRODUCTO', productoId: 'prod-1' }),
      item({ tipoItem: 'SERVICIO', servicioId: 'serv-1' }),
    ]);

    // subtotal 12.99 + 8 = 20.99; iva 15% de cada línea = 1.95 + 1.2 = 3.15
    expect(resultado.subtotal).toBe(20.99);
    expect(resultado.iva).toBe(3.15);
    expect(resultado.total).toBe(24.14);
    expect(resultado.items).toHaveLength(2);
  });

  it('aplica el descuento de línea antes de calcular IVA', async () => {
    prisma.producto.findUnique.mockResolvedValue(PRODUCTO_CON_IVA);

    const resultado = await service.calcular([
      item({ tipoItem: 'PRODUCTO', productoId: 'prod-1', descuento: 2.99 }),
    ]);

    // (12.99 - 2.99) = 10 subtotal; iva 15% = 1.5
    expect(resultado.subtotal).toBe(10);
    expect(resultado.iva).toBe(1.5);
    expect(resultado.descuentoTotal).toBe(2.99);
  });

  it('rechaza un descuento mayor al subtotal de la línea', async () => {
    prisma.producto.findUnique.mockResolvedValue(PRODUCTO_CON_IVA);

    await expect(
      service.calcular([item({ tipoItem: 'PRODUCTO', productoId: 'prod-1', descuento: 999 })]),
    ).rejects.toThrow(BadRequestException);
  });

  it('rechaza un ítem PRODUCTO sin productoId', async () => {
    await expect(service.calcular([item({ tipoItem: 'PRODUCTO' })])).rejects.toThrow(
      BadRequestException,
    );
  });

  it('rechaza un ítem SERVICIO sin servicioId', async () => {
    await expect(service.calcular([item({ tipoItem: 'SERVICIO' })])).rejects.toThrow(
      BadRequestException,
    );
  });

  it('rechaza un producto inexistente', async () => {
    prisma.producto.findUnique.mockResolvedValue(null);

    await expect(
      service.calcular([item({ tipoItem: 'PRODUCTO', productoId: 'no-existe' })]),
    ).rejects.toThrow(NotFoundException);
  });

  it('rechaza un producto inactivo (dado de baja)', async () => {
    prisma.producto.findUnique.mockResolvedValue({ ...PRODUCTO_CON_IVA, activo: false });

    await expect(
      service.calcular([item({ tipoItem: 'PRODUCTO', productoId: 'prod-1' })]),
    ).rejects.toThrow(NotFoundException);
  });

  it('rechaza un servicio inexistente', async () => {
    prisma.servicio.findUnique.mockResolvedValue(null);

    await expect(
      service.calcular([item({ tipoItem: 'SERVICIO', servicioId: 'no-existe' })]),
    ).rejects.toThrow(NotFoundException);
  });

  it('usa 15% por defecto si no hay fila de configuración', async () => {
    prisma.configuracion.findFirst.mockResolvedValue(null);
    prisma.producto.findUnique.mockResolvedValue(PRODUCTO_CON_IVA);

    const resultado = await service.calcular([
      item({ tipoItem: 'PRODUCTO', productoId: 'prod-1' }),
    ]);

    expect(resultado.items[0].ivaPorcentaje).toBe(15);
  });

  it('usa el porcentaje de IVA configurado, no siempre 15%', async () => {
    prisma.configuracion.findFirst.mockResolvedValue({ porcentajeIva: 12 });
    prisma.producto.findUnique.mockResolvedValue(PRODUCTO_CON_IVA);

    const resultado = await service.calcular([
      item({ tipoItem: 'PRODUCTO', productoId: 'prod-1' }),
    ]);

    expect(resultado.items[0].ivaPorcentaje).toBe(12);
    // 12.99 * 12% = 1.5588 -> round2 = 1.56
    expect(resultado.iva).toBe(1.56);
  });
});
