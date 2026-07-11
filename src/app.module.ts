import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './config/prisma.module';
import { CloudinaryModule } from './config/cloudinary.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { SucursalesModule } from './modules/sucursales/sucursales.module';
import { ConfiguracionModule } from './modules/configuracion/configuracion.module';
import { PdfModule } from './modules/pdf/pdf.module';
import { AuditoriaModule } from './modules/auditoria/auditoria.module';
import { CategoriasModule } from './modules/categorias/categorias.module';
import { MarcasModule } from './modules/marcas/marcas.module';
import { ProductosModule } from './modules/productos/productos.module';
import { InventarioModule } from './modules/inventario/inventario.module';
import { ClientesModule } from './modules/clientes/clientes.module';
import { VehiculosModule } from './modules/vehiculos/vehiculos.module';
import { ServiciosModule } from './modules/servicios/servicios.module';
import { VentasModule } from './modules/ventas/ventas.module';
import { CotizacionesModule } from './modules/cotizaciones/cotizaciones.module';
import { CajaModule } from './modules/caja/caja.module';
import { TransferenciasModule } from './modules/transferencias/transferencias.module';
import { ColaboradoresModule } from './modules/colaboradores/colaboradores.module';
import { ReportesModule } from './modules/reportes/reportes.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    CloudinaryModule,
    PdfModule,
    AuditoriaModule,
    AuthModule,
    UsuariosModule,
    SucursalesModule,
    ConfiguracionModule,
    CategoriasModule,
    MarcasModule,
    ProductosModule,
    InventarioModule,
    ClientesModule,
    VehiculosModule,
    ServiciosModule,
    VentasModule,
    CotizacionesModule,
    CajaModule,
    TransferenciasModule,
    ColaboradoresModule,
    ReportesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
