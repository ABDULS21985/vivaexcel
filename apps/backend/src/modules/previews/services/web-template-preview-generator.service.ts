import { Injectable, Logger } from '@nestjs/common';
import { WatermarkService } from './watermark.service';

export interface ScreenshotResult {
  breakpoint: string;
  width: number;
  height: number;
  imageBuffer: Buffer;
}

const BREAKPOINTS = {
  mobile: { width: 375, height: 812 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1440, height: 900 },
};

@Injectable()
export class WebTemplatePreviewGeneratorService {
  private readonly logger = new Logger(WebTemplatePreviewGeneratorService.name);

  constructor(private readonly watermarkService: WatermarkService) {}

  /**
   * Capture screenshots of a URL at multiple breakpoints using Puppeteer.
   * Falls back gracefully if Puppeteer is unavailable.
   */
  async generateScreenshots(
    url: string,
    options: {
      breakpoints?: (keyof typeof BREAKPOINTS)[];
      watermark?: boolean;
      timeout?: number;
    } = {},
  ): Promise<ScreenshotResult[]> {
    const {
      breakpoints = ['mobile', 'tablet', 'desktop'],
      watermark = true,
      timeout = 30000,
    } = options;

    const results: ScreenshotResult[] = [];

    try {
      const puppeteer = await import('puppeteer');
      const browser = await puppeteer.default.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      });

      try {
        for (const bp of breakpoints) {
          const viewport = BREAKPOINTS[bp];
          if (!viewport) continue;

          try {
            const page = await browser.newPage();
            await page.setViewport({ width: viewport.width, height: viewport.height });
            await page.goto(url, { waitUntil: 'networkidle2', timeout });

            // Wait a bit for animations to settle
            await page.evaluate(() => new Promise((resolve) => setTimeout(resolve, 2000)));

            let imageBuffer = (await page.screenshot({
              type: 'png',
              fullPage: false,
            })) as Buffer;

            await page.close();

            if (watermark) {
              imageBuffer = await this.watermarkService.applyWatermark(imageBuffer);
            }

            results.push({
              breakpoint: bp,
              width: viewport.width,
              height: viewport.height,
              imageBuffer,
            });
          } catch (err) {
            this.logger.warn(
              `Failed to capture screenshot at ${bp} (${viewport.width}x${viewport.height}): ${err instanceof Error ? err.message : String(err)}`,
            );
          }
        }
      } finally {
        await browser.close();
      }
    } catch (err) {
      this.logger.error(
        `Web template preview generation failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    return results;
  }
}
