"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./config/prisma.module");
const auth_module_1 = require("./modules/auth/auth.module");
const usuarios_module_1 = require("./modules/usuarios/usuarios.module");
const sucursales_module_1 = require("./modules/sucursales/sucursales.module");
const configuracion_module_1 = require("./modules/configuracion/configuracion.module");
const pdf_module_1 = require("./modules/pdf/pdf.module");
const auditoria_module_1 = require("./modules/auditoria/auditoria.module");
const categorias_module_1 = require("./modules/categorias/categorias.module");
const marcas_module_1 = require("./modules/marcas/marcas.module");
const productos_module_1 = require("./modules/productos/productos.module");
const inventario_module_1 = require("./modules/inventario/inventario.module");
const clientes_module_1 = require("./modules/clientes/clientes.module");
const vehiculos_module_1 = require("./modules/vehiculos/vehiculos.module");
const servicios_module_1 = require("./modules/servicios/servicios.module");
const ventas_module_1 = require("./modules/ventas/ventas.module");
const cotizaciones_module_1 = require("./modules/cotizaciones/cotizaciones.module");
const caja_module_1 = require("./modules/caja/caja.module");
const transferencias_module_1 = require("./modules/transferencias/transferencias.module");
const colaboradores_module_1 = require("./modules/colaboradores/colaboradores.module");
const reportes_module_1 = require("./modules/reportes/reportes.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            prisma_module_1.PrismaModule,
            pdf_module_1.PdfModule,
            auditoria_module_1.AuditoriaModule,
            auth_module_1.AuthModule,
            usuarios_module_1.UsuariosModule,
            sucursales_module_1.SucursalesModule,
            configuracion_module_1.ConfiguracionModule,
            categorias_module_1.CategoriasModule,
            marcas_module_1.MarcasModule,
            productos_module_1.ProductosModule,
            inventario_module_1.InventarioModule,
            clientes_module_1.ClientesModule,
            vehiculos_module_1.VehiculosModule,
            servicios_module_1.ServiciosModule,
            ventas_module_1.VentasModule,
            cotizaciones_module_1.CotizacionesModule,
            caja_module_1.CajaModule,
            transferencias_module_1.TransferenciasModule,
            colaboradores_module_1.ColaboradoresModule,
            reportes_module_1.ReportesModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map