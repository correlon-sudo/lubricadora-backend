import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';

export interface ColumnaTabla {
  titulo: string;
  ancho: number;
  align?: 'left' | 'right' | 'center';
}

@Injectable()
export class PdfService {
  crear(options?: PDFKit.PDFDocumentOptions): PDFKit.PDFDocument {
    return new PDFDocument({ size: 'A4', margin: 40, ...options });
  }

  aBuffer(doc: PDFKit.PDFDocument): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      doc.end();
    });
  }

  // Tabla de ancho fijo por columna, con salto de página automático
  // (repite el encabezado en cada página nueva — necesario para listados
  // largos como el catálogo de productos, no solo el detalle de un documento).
  dibujarTabla(
    doc: PDFKit.PDFDocument,
    x: number,
    y: number,
    columnas: ColumnaTabla[],
    filas: string[][],
    alturaFila = 20,
  ): number {
    const limiteInferior = doc.page.height - doc.page.margins.bottom;
    let cursorY = y;

    const dibujarEncabezado = () => {
      let cursorX = x;
      doc.font('Helvetica-Bold').fontSize(9);
      for (const col of columnas) {
        doc.text(col.titulo, cursorX, cursorY, { width: col.ancho, align: col.align ?? 'left' });
        cursorX += col.ancho;
      }
      cursorY += alturaFila;
      doc
        .moveTo(x, cursorY - 6)
        .lineTo(cursorX, cursorY - 6)
        .strokeColor('#cccccc')
        .stroke();
    };

    dibujarEncabezado();

    doc.font('Helvetica').fontSize(9);
    for (const fila of filas) {
      if (cursorY + alturaFila > limiteInferior) {
        doc.addPage();
        cursorY = doc.page.margins.top;
        dibujarEncabezado();
        doc.font('Helvetica').fontSize(9);
      }
      let cursorX = x;
      for (let i = 0; i < columnas.length; i++) {
        doc.text(fila[i] ?? '', cursorX, cursorY, {
          width: columnas[i].ancho,
          align: columnas[i].align ?? 'left',
        });
        cursorX += columnas[i].ancho;
      }
      cursorY += alturaFila;
    }

    return cursorY;
  }
}
