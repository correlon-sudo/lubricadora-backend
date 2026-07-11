-- CreateEnum
CREATE TYPE "TipoItemVenta" AS ENUM ('PRODUCTO', 'SERVICIO');

-- CreateEnum
CREATE TYPE "EstadoCotizacion" AS ENUM ('VIGENTE', 'CONVERTIDA', 'ANULADA', 'VENCIDA');

-- CreateEnum
CREATE TYPE "TipoComprobante" AS ENUM ('FACTURA', 'NOTA_VENTA', 'NOTA_PEDIDO', 'NOTA_ENTREGA');

-- CreateEnum
CREATE TYPE "EstadoVenta" AS ENUM ('EMITIDA', 'ANULADA');

-- CreateEnum
CREATE TYPE "FormaPago" AS ENUM ('EFECTIVO', 'TRANSFERENCIA', 'TARJETA');

-- CreateTable
CREATE TABLE "servicio" (
    "id" TEXT NOT NULL,
    "codigo" VARCHAR(40) NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "descripcion" TEXT,
    "precio" DECIMAL(12,2) NOT NULL,
    "iva_aplicable" BOOLEAN NOT NULL DEFAULT true,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "servicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cotizacion" (
    "id" TEXT NOT NULL,
    "numero" VARCHAR(20) NOT NULL,
    "sucursal_id" TEXT NOT NULL,
    "cliente_id" TEXT,
    "vehiculo_id" TEXT,
    "usuario_id" TEXT NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "descuento" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "iva" DECIMAL(12,2) NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,
    "estado" "EstadoCotizacion" NOT NULL DEFAULT 'VIGENTE',
    "validez_dias" INTEGER NOT NULL DEFAULT 8,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cotizacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cotizacion_detalle" (
    "id" TEXT NOT NULL,
    "cotizacion_id" TEXT NOT NULL,
    "tipo_item" "TipoItemVenta" NOT NULL,
    "producto_id" TEXT,
    "servicio_id" TEXT,
    "descripcion" VARCHAR(200) NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" DECIMAL(12,2) NOT NULL,
    "descuento" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "subtotal" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "cotizacion_detalle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venta" (
    "id" TEXT NOT NULL,
    "numero" VARCHAR(20) NOT NULL,
    "tipo_comprobante" "TipoComprobante" NOT NULL,
    "sucursal_id" TEXT NOT NULL,
    "cliente_id" TEXT,
    "vehiculo_id" TEXT,
    "usuario_id" TEXT NOT NULL,
    "caja_id" TEXT,
    "cotizacion_id" TEXT,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "descuento_total" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "iva" DECIMAL(12,2) NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,
    "estado" "EstadoVenta" NOT NULL DEFAULT 'EMITIDA',
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "venta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venta_detalle" (
    "id" TEXT NOT NULL,
    "venta_id" TEXT NOT NULL,
    "tipo_item" "TipoItemVenta" NOT NULL,
    "producto_id" TEXT,
    "servicio_id" TEXT,
    "descripcion" VARCHAR(200) NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" DECIMAL(12,2) NOT NULL,
    "descuento" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "iva_porcentaje" DECIMAL(5,2) NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "venta_detalle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pago_venta" (
    "id" TEXT NOT NULL,
    "venta_id" TEXT NOT NULL,
    "forma_pago" "FormaPago" NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,
    "referencia" VARCHAR(100),

    CONSTRAINT "pago_venta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "servicio_codigo_key" ON "servicio"("codigo");

-- CreateIndex
CREATE INDEX "servicio_nombre_idx" ON "servicio"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "cotizacion_numero_key" ON "cotizacion"("numero");

-- CreateIndex
CREATE INDEX "cotizacion_sucursal_id_fecha_idx" ON "cotizacion"("sucursal_id", "fecha");

-- CreateIndex
CREATE UNIQUE INDEX "venta_numero_key" ON "venta"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "venta_cotizacion_id_key" ON "venta"("cotizacion_id");

-- CreateIndex
CREATE INDEX "venta_sucursal_id_fecha_idx" ON "venta"("sucursal_id", "fecha");

-- AddForeignKey
ALTER TABLE "cotizacion" ADD CONSTRAINT "cotizacion_sucursal_id_fkey" FOREIGN KEY ("sucursal_id") REFERENCES "sucursal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotizacion" ADD CONSTRAINT "cotizacion_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotizacion" ADD CONSTRAINT "cotizacion_vehiculo_id_fkey" FOREIGN KEY ("vehiculo_id") REFERENCES "vehiculo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotizacion" ADD CONSTRAINT "cotizacion_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotizacion_detalle" ADD CONSTRAINT "cotizacion_detalle_cotizacion_id_fkey" FOREIGN KEY ("cotizacion_id") REFERENCES "cotizacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotizacion_detalle" ADD CONSTRAINT "cotizacion_detalle_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "producto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotizacion_detalle" ADD CONSTRAINT "cotizacion_detalle_servicio_id_fkey" FOREIGN KEY ("servicio_id") REFERENCES "servicio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venta" ADD CONSTRAINT "venta_sucursal_id_fkey" FOREIGN KEY ("sucursal_id") REFERENCES "sucursal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venta" ADD CONSTRAINT "venta_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venta" ADD CONSTRAINT "venta_vehiculo_id_fkey" FOREIGN KEY ("vehiculo_id") REFERENCES "vehiculo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venta" ADD CONSTRAINT "venta_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venta" ADD CONSTRAINT "venta_cotizacion_id_fkey" FOREIGN KEY ("cotizacion_id") REFERENCES "cotizacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venta_detalle" ADD CONSTRAINT "venta_detalle_venta_id_fkey" FOREIGN KEY ("venta_id") REFERENCES "venta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venta_detalle" ADD CONSTRAINT "venta_detalle_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "producto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venta_detalle" ADD CONSTRAINT "venta_detalle_servicio_id_fkey" FOREIGN KEY ("servicio_id") REFERENCES "servicio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pago_venta" ADD CONSTRAINT "pago_venta_venta_id_fkey" FOREIGN KEY ("venta_id") REFERENCES "venta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
