"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new client_1.PrismaClient();
async function main() {
    const existente = await prisma.sucursal.findFirst({
        where: { esMatriz: true, nombre: 'Matriz' },
    });
    const sucursalMatriz = existente ??
        (await prisma.sucursal.create({
            data: { nombre: 'Matriz', esMatriz: true },
        }));
    const passwordHash = await bcrypt.hash('Admin123!', parseInt(process.env.BCRYPT_ROUNDS ?? '12', 10));
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
            rol: client_1.RolUsuario.ADMIN,
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
    await prisma.cliente.upsert({
        where: { identificacion: '9999999999999' },
        update: {},
        create: {
            tipoIdentificacion: client_1.TipoIdentificacion.CEDULA,
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
//# sourceMappingURL=seed.js.map