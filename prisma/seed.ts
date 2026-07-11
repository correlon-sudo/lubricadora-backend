import 'dotenv/config';
import { PrismaClient, RolUsuario, TipoIdentificacion } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // @IsUUID() (class-validator) exige un dígito de versión válido (1-5);
  // un id "legible" tipo 00000000-...-0001 lo rechaza. Se busca por
  // esMatriz+nombre para que el upsert siga siendo idempotente sin fijar
  // un id inventado.
  const existente = await prisma.sucursal.findFirst({
    where: { esMatriz: true, nombre: 'Matriz' },
  });
  const sucursalMatriz =
    existente ??
    (await prisma.sucursal.create({
      data: { nombre: 'Matriz', esMatriz: true },
    }));

  const passwordHash = await bcrypt.hash(
    'Admin123!',
    parseInt(process.env.BCRYPT_ROUNDS ?? '12', 10),
  );

  await prisma.usuario.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      sucursalId: sucursalMatriz.id,
      nombres: 'Admin',
      apellidos: 'Sistema',
      cedula: '1710034065',
      email: 'admin@lubricadora.local',
      username: 'admin',
      passwordHash,
      rol: RolUsuario.ADMIN,
    },
  });

  const configExistente = await prisma.configuracion.findFirst();
  if (!configExistente) {
    await prisma.configuracion.create({
      data: {
        razonSocial: 'Lubricadora',
        nombreComercial: 'Lubricadora',
        porcentajeIva: 15.0,
        moneda: 'USD',
      },
    });
  }

  // "9999999999999" es la identificación convencional de Consumidor Final
  // en el SRI ecuatoriano para ventas sin cliente identificado.
  await prisma.cliente.upsert({
    where: { identificacion: '9999999999999' },
    update: {},
    create: {
      tipoIdentificacion: TipoIdentificacion.CEDULA,
      identificacion: '9999999999999',
      nombres: 'Consumidor',
      apellidos: 'Final',
      esConsumidorFinal: true,
    },
  });

  console.log('Seed OK — admin/Admin123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
