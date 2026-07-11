import * as bcrypt from 'bcrypt';
import { PrismaClient, RolUsuario, TipoIdentificacion } from '@prisma/client';

// Orden pensado para TRUNCATE ... CASCADE — no importa el orden real ya
// que CASCADE resuelve las FKs, pero se listan las tablas relevantes al
// flujo de ventas/caja/inventario que ejercitan los e2e.
const TABLAS_A_LIMPIAR = [
  'auditoria',
  'pago_venta',
  'venta_detalle',
  'venta',
  'cotizacion_detalle',
  'cotizacion',
  'transferencia_detalle',
  'transferencia',
  'movimiento_caja',
  'caja',
  'movimiento_inventario',
  'inventario_sucursal',
  'producto',
  'marca',
  'categoria',
  'vehiculo',
  'cliente',
  'refresh_token',
  'usuario',
  'sucursal',
  'configuracion',
];

export async function limpiarDb(prisma: PrismaClient) {
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE ${TABLAS_A_LIMPIAR.map((t) => `"${t}"`).join(', ')} RESTART IDENTITY CASCADE;`,
  );
}

export interface FixturesE2e {
  sucursalId: string;
  sucursalNorteId: string;
  productoId: string;
  passwords: { admin: string; encargado: string; vendedor: string };
}

// Fixtures mínimos y determinísticos para los e2e de ventas/caja/inventario.
// Contraseñas simples porque es una DB de test local, descartable.
export async function sembrarFixtures(prisma: PrismaClient): Promise<FixturesE2e> {
  const sucursal = await prisma.sucursal.create({
    data: { nombre: 'Matriz', esMatriz: true },
  });
  const sucursalNorte = await prisma.sucursal.create({
    data: { nombre: 'Sucursal Norte', esMatriz: false },
  });

  await prisma.configuracion.create({
    data: { razonSocial: 'Lubricadora Test', porcentajeIva: 15, moneda: 'USD' },
  });

  await prisma.cliente.create({
    data: {
      tipoIdentificacion: TipoIdentificacion.CEDULA,
      identificacion: '9999999999999',
      nombres: 'Consumidor',
      apellidos: 'Final',
      esConsumidorFinal: true,
    },
  });

  const passwords = { admin: 'Admin123!', encargado: 'Enc123!', vendedor: 'Vend123!' };
  const hash = (pw: string) => bcrypt.hash(pw, 4); // rounds bajos: tests rápidos, no es prod

  await prisma.usuario.create({
    data: {
      sucursalId: sucursal.id,
      nombres: 'Admin',
      apellidos: 'Test',
      cedula: '1710034065',
      email: 'admin@test.local',
      username: 'admin',
      passwordHash: await hash(passwords.admin),
      rol: RolUsuario.ADMIN,
    },
  });
  await prisma.usuario.create({
    data: {
      sucursalId: sucursal.id,
      nombres: 'Encargada',
      apellidos: 'Test',
      cedula: '1710034073',
      email: 'encargada@test.local',
      username: 'encargada1',
      passwordHash: await hash(passwords.encargado),
      rol: RolUsuario.ENCARGADO,
    },
  });
  await prisma.usuario.create({
    data: {
      sucursalId: sucursal.id,
      nombres: 'Vendedor',
      apellidos: 'Test',
      cedula: '1710034081',
      email: 'vendedor@test.local',
      username: 'vendedor1',
      passwordHash: await hash(passwords.vendedor),
      rol: RolUsuario.VENDEDOR,
    },
  });

  const categoria = await prisma.categoria.create({ data: { nombre: 'Lubricantes' } });
  const marca = await prisma.marca.create({ data: { nombre: 'Mobil' } });

  const producto = await prisma.producto.create({
    data: {
      codigo: 'ACE-TEST-001',
      nombre: 'Aceite 20W50 (test)',
      marcaId: marca.id,
      categoriaId: categoria.id,
      precioCosto: 8.5,
      precioVenta: 10,
      ivaAplicable: true,
    },
  });

  await prisma.inventarioSucursal.create({
    data: { productoId: producto.id, sucursalId: sucursal.id, cantidad: 5 },
  });

  return {
    sucursalId: sucursal.id,
    sucursalNorteId: sucursalNorte.id,
    productoId: producto.id,
    passwords,
  };
}
