/*
  Warnings:

  - Added the required column `iva_porcentaje` to the `cotizacion_detalle` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "cotizacion_detalle" ADD COLUMN     "iva_porcentaje" DECIMAL(5,2) NOT NULL;
