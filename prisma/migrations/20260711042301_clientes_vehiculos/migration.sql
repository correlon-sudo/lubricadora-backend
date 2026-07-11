-- CreateEnum
CREATE TYPE "TipoIdentificacion" AS ENUM ('CEDULA', 'RUC', 'PASAPORTE');

-- CreateTable
CREATE TABLE "cliente" (
    "id" TEXT NOT NULL,
    "tipo_identificacion" "TipoIdentificacion" NOT NULL,
    "identificacion" VARCHAR(20) NOT NULL,
    "nombres" VARCHAR(100) NOT NULL,
    "apellidos" VARCHAR(100),
    "razon_social" VARCHAR(160),
    "email" VARCHAR(150),
    "telefono" VARCHAR(30),
    "direccion" VARCHAR(200),
    "es_consumidor_final" BOOLEAN NOT NULL DEFAULT false,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehiculo" (
    "id" TEXT NOT NULL,
    "cliente_id" TEXT NOT NULL,
    "placa" VARCHAR(10) NOT NULL,
    "marca" VARCHAR(60) NOT NULL,
    "modelo" VARCHAR(60) NOT NULL,
    "anio" INTEGER,
    "color" VARCHAR(40),
    "kilometraje" INTEGER,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehiculo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cliente_identificacion_key" ON "cliente"("identificacion");

-- CreateIndex
CREATE INDEX "cliente_nombres_idx" ON "cliente"("nombres");

-- CreateIndex
CREATE INDEX "cliente_telefono_idx" ON "cliente"("telefono");

-- CreateIndex
CREATE UNIQUE INDEX "vehiculo_placa_key" ON "vehiculo"("placa");

-- CreateIndex
CREATE INDEX "vehiculo_marca_idx" ON "vehiculo"("marca");

-- CreateIndex
CREATE INDEX "vehiculo_modelo_idx" ON "vehiculo"("modelo");

-- AddForeignKey
ALTER TABLE "vehiculo" ADD CONSTRAINT "vehiculo_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
