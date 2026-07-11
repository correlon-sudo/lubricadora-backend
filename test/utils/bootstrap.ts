import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { HttpExceptionFilter } from '../../src/common/filters/http-exception.filter';
import { TransformInterceptor } from '../../src/common/interceptors/transform.interceptor';
import { PdfService } from '../../src/modules/pdf/pdf.service';

// Puppeteer publica un paquete ESM (puppeteer-core) que ts-jest no puede
// parsear en node_modules sin transformIgnorePatterns adicional. Ningún
// e2e ejercita endpoints de PDF, así que se reemplaza por un stub — más
// simple y rápido que lidiar con la config de transform de Jest.
class PdfServiceMock {
  htmlToPdf() {
    return Promise.resolve(Buffer.from(''));
  }
}

// Replica el bootstrap real de main.ts (pipes/filtro/interceptor/prefijo)
// para que los e2e vean exactamente el mismo comportamiento HTTP que
// producción — sin swagger/static assets/listen, que no hacen falta acá.
export async function bootstrapTestApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(PdfService)
    .useClass(PdfServiceMock)
    .compile();

  const app = moduleRef.createNestApplication();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());
  app.setGlobalPrefix('api/v1', { exclude: ['health'] });

  await app.init();
  return app;
}
