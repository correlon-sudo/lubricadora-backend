// Stub de 'puppeteer' para que Jest no intente parsear el paquete real
// (publica ESM vía puppeteer-core, ts-jest no lo transforma en
// node_modules). Ningún e2e llama a PdfService.htmlToPdf(), así que esto
// nunca se ejecuta de verdad — solo hace falta que el import resuelva.
export default {
  launch: async () => ({
    close: async () => {},
    newPage: async () => ({
      setContent: async () => {},
      pdf: async () => Buffer.from(''),
      close: async () => {},
    }),
  }),
};
