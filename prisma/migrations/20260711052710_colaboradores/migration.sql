-- CreateEnum
CREATE TYPE "TipoSueldo" AS ENUM ('SEMANAL', 'MENSUAL');

-- CreateEnum
CREATE TYPE "EstadoAsistencia" AS ENUM ('PRESENTE', 'FALTA', 'PERMISO', 'MEDIO_DIA');

-- CreateEnum
CREATE TYPE "EstadoNomina" AS ENUM ('PENDIENTE', 'PAGADO');

-- CreateTable
CREATE TABLE "colaborador" (
    "id" TEXT NOT NULL,
    "sucursal_id" TEXT NOT NULL,
    "usuario_id" TEXT,
    "nombres" VARCHAR(100) NOT NULL,
    "apellidos" VARCHAR(100) NOT NULL,
    "cedula" VARCHAR(13) NOT NULL,
    "telefono" VARCHAR(30),
    "direccion" VARCHAR(200),
    "email" VARCHAR(150),
    "cargo" VARCHAR(100),
    "foto_url" TEXT,
    "tipo_sueldo" "TipoSueldo" NOT NULL,
    "monto_sueldo" DECIMAL(12,2) NOT NULL,
    "fecha_ingreso" DATE NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "colaborador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adelanto_sueldo" (
    "id" TEXT NOT NULL,
    "colaborador_id" TEXT NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,
    "motivo" VARCHAR(200),
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuario_registra_id" TEXT NOT NULL,

    CONSTRAINT "adelanto_sueldo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asistencia" (
    "id" TEXT NOT NULL,
    "colaborador_id" TEXT NOT NULL,
    "fecha" DATE NOT NULL,
    "estado" "EstadoAsistencia" NOT NULL,
    "observacion" TEXT,

    CONSTRAINT "asistencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nomina" (
    "id" TEXT NOT NULL,
    "colaborador_id" TEXT NOT NULL,
    "periodo_inicio" DATE NOT NULL,
    "periodo_fin" DATE NOT NULL,
    "sueldo_base" DECIMAL(12,2) NOT NULL,
    "total_adelantos" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_descuentos" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "neto_pagar" DECIMAL(12,2) NOT NULL,
    "estado" "EstadoNomina" NOT NULL DEFAULT 'PENDIENTE',
    "fecha_pago" TIMESTAMP(3),

    CONSTRAINT "nomina_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "colaborador_usuario_id_key" ON "colaborador"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "colaborador_cedula_key" ON "colaborador"("cedula");

-- CreateIndex
CREATE INDEX "colaborador_sucursal_id_idx" ON "colaborador"("sucursal_id");

-- CreateIndex
CREATE INDEX "adelanto_sueldo_colaborador_id_fecha_idx" ON "adelanto_sueldo"("colaborador_id", "fecha");

-- CreateIndex
CREATE UNIQUE INDEX "asistencia_colaborador_id_fecha_key" ON "asistencia"("colaborador_id", "fecha");

-- CreateIndex
CREATE UNIQUE INDEX "nomina_colaborador_id_periodo_inicio_periodo_fin_key" ON "nomina"("colaborador_id", "periodo_inicio", "periodo_fin");

-- AddForeignKey
ALTER TABLE "colaborador" ADD CONSTRAINT "colaborador_sucursal_id_fkey" FOREIGN KEY ("sucursal_id") REFERENCES "sucursal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "colaborador" ADD CONSTRAINT "colaborador_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adelanto_sueldo" ADD CONSTRAINT "adelanto_sueldo_colaborador_id_fkey" FOREIGN KEY ("colaborador_id") REFERENCES "colaborador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adelanto_sueldo" ADD CONSTRAINT "adelanto_sueldo_usuario_registra_id_fkey" FOREIGN KEY ("usuario_registra_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asistencia" ADD CONSTRAINT "asistencia_colaborador_id_fkey" FOREIGN KEY ("colaborador_id") REFERENCES "colaborador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nomina" ADD CONSTRAINT "nomina_colaborador_id_fkey" FOREIGN KEY ("colaborador_id") REFERENCES "colaborador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
