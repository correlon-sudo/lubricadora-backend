-- CreateIndex
CREATE INDEX "cotizacion_detalle_cotizacion_id_idx" ON "cotizacion_detalle"("cotizacion_id");

-- CreateIndex
CREATE INDEX "movimiento_caja_caja_id_idx" ON "movimiento_caja"("caja_id");

-- CreateIndex
CREATE INDEX "pago_venta_venta_id_idx" ON "pago_venta"("venta_id");

-- CreateIndex
CREATE INDEX "transferencia_detalle_transferencia_id_idx" ON "transferencia_detalle"("transferencia_id");

-- CreateIndex
CREATE INDEX "vehiculo_cliente_id_idx" ON "vehiculo"("cliente_id");

-- CreateIndex
CREATE INDEX "venta_fecha_idx" ON "venta"("fecha");

-- CreateIndex
CREATE INDEX "venta_detalle_venta_id_idx" ON "venta_detalle"("venta_id");
