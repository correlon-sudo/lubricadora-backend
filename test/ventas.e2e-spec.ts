import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { bootstrapTestApp } from './utils/bootstrap';
import { limpiarDb, sembrarFixtures, FixturesE2e } from './utils/seed';

// Requiere Postgres local (docker compose, puerto 5433) con las
// migraciones aplicadas. Correr con:
//   DATABASE_URL=postgresql://lubricadora:lubricadora@localhost:5433/lubricadora
//   DIRECT_URL=postgresql://lubricadora:lubricadora@localhost:5433/lubricadora
//   JWT_ACCESS_SECRET=test JWT_REFRESH_SECRET=test
//   npx jest --config test/jest-e2e.json ventas
describe('Ventas — flujos de negocio (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let fixtures: FixturesE2e;
  let tokenAdmin: string;

  const api = () => request(app.getHttpServer());

  async function login(username: string, password: string): Promise<string> {
    const res = await api()
      .post('/api/v1/auth/login')
      .send({ username, password })
      .expect(201);
    return res.body.data.token.access_token;
  }

  beforeAll(async () => {
    app = await bootstrapTestApp();
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    await limpiarDb(prisma);
    fixtures = await sembrarFixtures(prisma);
    tokenAdmin = await login('admin', fixtures.passwords.admin);
  });

  it('bloquea crear una venta sin caja abierta', async () => {
    const res = await api()
      .post('/api/v1/ventas')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        tipoComprobante: 'NOTA_VENTA',
        items: [{ tipoItem: 'PRODUCTO', productoId: fixtures.productoId, cantidad: 1 }],
        pagos: [{ formaPago: 'EFECTIVO', monto: 11.5 }],
      })
      .expect(400);

    expect(res.body.message.message).toMatch(/caja abierta/i);
  });

  it('crea una venta, descuenta stock, y anularla lo revierte (doble-anulación bloqueada)', async () => {
    await api()
      .post('/api/v1/caja/abrir')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ montoInicial: 50 })
      .expect(201);

    const ventaRes = await api()
      .post('/api/v1/ventas')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        tipoComprobante: 'NOTA_VENTA',
        items: [{ tipoItem: 'PRODUCTO', productoId: fixtures.productoId, cantidad: 2 }],
        pagos: [{ formaPago: 'EFECTIVO', monto: 23 }], // 10*2 + 15% iva = 23
      })
      .expect(201);

    expect(ventaRes.body.data.estado).toBe('EMITIDA');
    expect(ventaRes.body.data.total).toBe(23);

    const inventarioTrasVenta = await prisma.inventarioSucursal.findFirst({
      where: { productoId: fixtures.productoId, sucursalId: fixtures.sucursalId },
    });
    expect(inventarioTrasVenta?.cantidad).toBe(3); // 5 - 2

    const ventaId = ventaRes.body.data.id;

    // anular revierte el stock
    const anuladaRes = await api()
      .patch(`/api/v1/ventas/${ventaId}/anular`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .expect(200);
    expect(anuladaRes.body.data.estado).toBe('ANULADA');

    const inventarioTrasAnular = await prisma.inventarioSucursal.findFirst({
      where: { productoId: fixtures.productoId, sucursalId: fixtures.sucursalId },
    });
    expect(inventarioTrasAnular?.cantidad).toBe(5); // vuelve al original

    // doble-anulación bloqueada
    const dobleAnularRes = await api()
      .patch(`/api/v1/ventas/${ventaId}/anular`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .expect(400);
    expect(dobleAnularRes.body.message.message).toMatch(/ya está anulada/i);
  });

  it('bloquea vender con stock insuficiente y no descuenta nada (rollback limpio)', async () => {
    await api()
      .post('/api/v1/caja/abrir')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ montoInicial: 50 })
      .expect(201);

    await api()
      .post('/api/v1/ventas')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        tipoComprobante: 'NOTA_VENTA',
        items: [{ tipoItem: 'PRODUCTO', productoId: fixtures.productoId, cantidad: 999 }],
        pagos: [{ formaPago: 'EFECTIVO', monto: 999 * 11.5 }],
      })
      .expect(400);

    const inventario = await prisma.inventarioSucursal.findFirst({
      where: { productoId: fixtures.productoId, sucursalId: fixtures.sucursalId },
    });
    expect(inventario?.cantidad).toBe(5); // intacto, el rollback de la transacción funcionó
  });

  it('bloquea vender con la caja cerrada', async () => {
    const abrirRes = await api()
      .post('/api/v1/caja/abrir')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ montoInicial: 50 })
      .expect(201);

    await api()
      .patch(`/api/v1/caja/${abrirRes.body.data.id}/cerrar`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ montoContado: 50 })
      .expect(200);

    const res = await api()
      .post('/api/v1/ventas')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        tipoComprobante: 'NOTA_VENTA',
        items: [{ tipoItem: 'PRODUCTO', productoId: fixtures.productoId, cantidad: 1 }],
        pagos: [{ formaPago: 'EFECTIVO', monto: 11.5 }],
      })
      .expect(400);

    expect(res.body.message.message).toMatch(/caja abierta/i);
  });

  it('bloquea abrir una segunda caja mientras la primera sigue abierta', async () => {
    await api()
      .post('/api/v1/caja/abrir')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ montoInicial: 50 })
      .expect(201);

    await api()
      .post('/api/v1/caja/abrir')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ montoInicial: 50 })
      .expect(409);
  });

  it('VENDEDOR no puede anular una venta (403)', async () => {
    await api()
      .post('/api/v1/caja/abrir')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ montoInicial: 50 })
      .expect(201);

    const ventaRes = await api()
      .post('/api/v1/ventas')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        tipoComprobante: 'NOTA_VENTA',
        items: [{ tipoItem: 'PRODUCTO', productoId: fixtures.productoId, cantidad: 1 }],
        pagos: [{ formaPago: 'EFECTIVO', monto: 11.5 }],
      })
      .expect(201);

    const tokenVendedor = await login('vendedor1', fixtures.passwords.vendedor);

    await api()
      .patch(`/api/v1/ventas/${ventaRes.body.data.id}/anular`)
      .set('Authorization', `Bearer ${tokenVendedor}`)
      .expect(403);
  });
});
