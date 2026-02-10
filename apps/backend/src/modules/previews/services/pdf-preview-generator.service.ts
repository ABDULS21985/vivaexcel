import { Injectable, Logger } from '@nestjs/common';
import { WatermarkService } from './watermark.service';

@Injectable()
export class PdfPreviewGeneratorService {
  private readonly logger = new Logger(PdfPreviewGeneratorService.name);

  constructor(private readonly watermarkService: WatermarkService) {}

  /**
   * Extract pages from a PDF buffer and convert them to PNG images.
   * Uses pdf2pic for conversion. Falls back gracefully if pdf2pic/graphicsmagick is unavailable.
   */
  async generatePagePreviews(
    pdfBuffer: Buffer,
    options: { maxPages?: number; watermark?: boolean } = {},
  ): Promise<{ pageNumber: number; imageBuffer: Buffer; width: number; height: number }[]> {
    const { maxPages = 5, watermark = true } = options;
    const results: { pageNumber: number; imageBuffer: Buffer; width: number; height: number }[] = [];

    try {
      // Dynamic import pdf2pic to handle missing native dependencies gracefully
      const { fromBuffer } = await import('pdf2pic');

      const converter = fromBuffer(pdfBuffer, {
        density: 150,
        format: 'png',
        width: 1280,
        height: 720,
        saveFilename: 'page',
        savePath: '/tmp',
      });

      for (let page = 1; page <= maxPages; page++) {
        try {
          const result = await converter(page, { responseType: 'buffer' });
          if (result.buffer) {
            let imageBuffer = result.buffer as Buffer;
            if (watermark) {
              imageBuffer = await this.watermarkService.applyWatermark(imageBuffer);
            }
            results.push({
              pageNumber: page,
              imageBuffer,
              width: result.width ?? 1280,
              height: result.height ?? 720,
            });
          }
        } catch (err) {
          this.logger.warn(`Failed to convert PDF page ${page}: ${err instanceof Error ? err.message : String(err)}`);
          break; // Stop if we've gone past the last page
        }
      }
    } catch (err) {
      this.logger.error(`PDF preview generation failed: ${err instanceof Error ? err.message : String(err)}`);
    }

    return results;
  }
}
