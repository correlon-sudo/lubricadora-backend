-- CreateEnum
CREATE TYPE "EstadoTransferencia" AS ENUM ('PENDIENTE', 'EN_TRANSITO', 'RECIBIDA', 'ANULADA');

-- CreateTable
CREATE TABLE "transferencia" (
    "id" TEXT NOT NULL,
    "numero" VARCHAR(20) NOT NULL,
    "sucursal_origen_id" TEXT NOT NULL,
    "sucursal_destino_id" TEXT NOT NULL,
    "estado" "EstadoTransferencia" NOT NULL DEFAULT 'PENDIENTE',
    "usuario_envia_id" TEXT NOT NULL,
    "usuario_recibe_id" TEXT,
    "fecha_envio" TIMESTAMP(3),
    "fecha_recepcion" TIMESTAMP(3),
    "observacion" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transferencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transferencia_detalle" (
    "id" TEXT NOT NULL,
    "transferencia_id" TEXT NOT NULL,
    "producto_id" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "cantidad_recibida" INTEGER,

    CONSTRAINT "transferencia_detalle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "transferencia_numero_key" ON "transferencia"("numero");

-- CreateIndex
CREATE INDEX "transferencia_sucursal_origen_id_idx" ON "transferencia"("sucursal_origen_id");

-- CreateIndex
CREATE INDEX "transferencia_sucursal_destino_id_idx" ON "transferencia"("sucursal_destino_id");

-- AddForeignKey
ALTER TABLE "transferencia" ADD CONSTRAINT "transferencia_sucursal_origen_id_fkey" FOREIGN KEY ("sucursal_origen_id") REFERENCES "sucursal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transferencia" ADD CONSTRAINT "transferencia_sucursal_destino_id_fkey" FOREIGN KEY ("sucursal_destino_id") REFERENCES "sucursal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transferencia" ADD CONSTRAINT "transferencia_usuario_envia_id_fkey" FOREIGN KEY ("usuario_envia_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transferencia" ADD CONSTRAINT "transferencia_usuario_recibe_id_fkey" FOREIGN KEY ("usuario_recibe_id") REFERENCES "usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transferencia_detalle" ADD CONSTRAINT "transferencia_detalle_transferencia_id_fkey" FOREIGN KEY ("transferencia_id") REFERENCES "transferencia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transferencia_detalle" ADD CONSTRAINT "transferencia_detalle_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
