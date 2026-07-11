import { OnModuleDestroy } from '@nestjs/common';
export declare class PdfService implements OnModuleDestroy {
    private browser?;
    private getBrowser;
    htmlToPdf(html: string): Promise<Buffer>;
    onModuleDestroy(): Promise<void>;
}
