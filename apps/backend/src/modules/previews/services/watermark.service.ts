import { Injectable, Logger } from '@nestjs/common';
import sharp from 'sharp';

export interface WatermarkOptions {
  /** Text to overlay on the image */
  text?: string;
  /** Opacity of the watermark (0.0 - 1.0) */
  opacity?: number;
  /** Rotation angle in degrees */
  angle?: number;
  /** Color of the watermark text */
  color?: string;
  /** Whether to repeat the watermark in a diagonal pattern */
  repeat?: boolean;
}

const DEFAULT_OPTIONS: Required<WatermarkOptions> = {
  text: 'PREVIEW',
  opacity: 0.15,
  angle: -45,
  color: '#888888',
  repeat: true,
};

@Injectable()
export class WatermarkService {
  private readonly logger = new Logger(WatermarkService.name);

  /**
   * Apply a diagonal "PREVIEW" watermark overlay to an image buffer.
   * Generates an SVG with repeated diagonal text at ~15% opacity,
   * then composites it onto the source image using Sharp.
   */
  async applyWatermark(
    imageBuffer: Buffer,
    options?: WatermarkOptions,
  ): Promise<Buffer> {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    try {
      const metadata = await sharp(imageBuffer).metadata();
      const width = metadata.width ?? 800;
      const height = metadata.height ?? 600;

      const svgOverlay = this.generateWatermarkSvg(width, height, opts);

      return sharp(imageBuffer)
        .composite([
          {
            input: Buffer.from(svgOverlay),
            top: 0,
            left: 0,
          },
        ])
        .png({ quality: 90 })
        .toBuffer();
    } catch (err) {
      this.logger.error(
        `Failed to apply watermark: ${err instanceof Error ? err.message : String(err)}`,
      );
      // Return the original buffer if watermarking fails
      return imageBuffer;
    }
  }

  /**
   * Generate an SVG overlay with repeated diagonal watermark text.
   */
  private generateWatermarkSvg(
    width: number,
    height: number,
    opts: Required<WatermarkOptions>,
  ): string {
    const escapedText = this.escapeXml(opts.text);
    const fontSize = Math.max(Math.floor(Math.min(width, height) / 8), 24);

    if (opts.repeat) {
      return this.generateRepeatedWatermarkSvg(
        width,
        height,
        escapedText,
        fontSize,
        opts,
      );
    }

    return this.generateSingleWatermarkSvg(
      width,
      height,
      escapedText,
      fontSize,
      opts,
    );
  }

  private generateRepeatedWatermarkSvg(
    width: number,
    height: number,
    text: string,
    fontSize: number,
    opts: Required<WatermarkOptions>,
  ): string {
    // Calculate spacing between watermark instances
    const spacingX = fontSize * text.length * 0.8;
    const spacingY = fontSize * 3;

    // Generate diagonal to cover the entire image
    const diagonal = Math.sqrt(width * width + height * height);
    const cols = Math.ceil(diagonal / spacingX) + 2;
    const rows = Math.ceil(diagonal / spacingY) + 2;

    let textElements = '';
    for (let row = -rows; row <= rows; row++) {
      for (let col = -cols; col <= cols; col++) {
        const x = col * spacingX;
        const y = row * spacingY;
        textElements += `      <text x="${x}" y="${y}" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="bold" fill="${opts.color}" text-anchor="middle" dominant-baseline="central">${text}</text>\n`;
      }
    }

    return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>text { user-select: none; }</style>
  </defs>
  <g opacity="${opts.opacity}" transform="translate(${width / 2}, ${height / 2}) rotate(${opts.angle})">
${textElements}  </g>
</svg>`;
  }

  private generateSingleWatermarkSvg(
    width: number,
    height: number,
    text: string,
    fontSize: number,
    opts: Required<WatermarkOptions>,
  ): string {
    const largeFontSize = fontSize * 2;

    return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <g opacity="${opts.opacity}" transform="translate(${width / 2}, ${height / 2}) rotate(${opts.angle})">
    <text x="0" y="0" font-family="Arial, Helvetica, sans-serif" font-size="${largeFontSize}" font-weight="bold" fill="${opts.color}" text-anchor="middle" dominant-baseline="central">${text}</text>
  </g>
</svg>`;
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
