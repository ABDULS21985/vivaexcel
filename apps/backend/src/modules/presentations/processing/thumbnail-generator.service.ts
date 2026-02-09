import { Injectable, Inject, Logger } from '@nestjs/common';
import { nanoid } from 'nanoid';
import JSZip from 'jszip';
import sharp from 'sharp';
import { StorageStrategy, STORAGE_STRATEGY } from '../../media/strategies/storage.interface';

// ──────────────────────────────────────────────
//  Result interfaces
// ──────────────────────────────────────────────

export interface ThumbnailResult {
  slideNumber: number;
  thumbnailUrl: string;
  thumbnailKey: string;
  previewUrl: string | null;
  previewKey: string | null;
  width: number;
  height: number;
}

// ──────────────────────────────────────────────
//  Constants
// ──────────────────────────────────────────────

const THUMBNAIL_WIDTH = 400;
const THUMBNAIL_HEIGHT = 225; // 16:9 ratio
const PREVIEW_WIDTH = 1280;
const PREVIEW_HEIGHT = 720;
const DEFAULT_COLORS = ['#4F46E5', '#7C3AED', '#2563EB', '#0891B2', '#059669', '#D97706'];

@Injectable()
export class ThumbnailGeneratorService {
  private readonly logger = new Logger(ThumbnailGeneratorService.name);

  constructor(
    @Inject(STORAGE_STRATEGY)
    private readonly storageStrategy: StorageStrategy,
  ) {}

  // ──────────────────────────────────────────────
  //  Public API
  // ──────────────────────────────────────────────

  async generateThumbnails(
    buffer: Buffer,
    presentationId: string,
    slideCount: number,
    titles: (string | null)[],
    colorSchemes?: { name: string; colors: string[] }[],
  ): Promise<ThumbnailResult[]> {
    const zip = await JSZip.loadAsync(buffer);
    const results: ThumbnailResult[] = [];

    // Try to extract the package thumbnail first (docProps/thumbnail.jpeg)
    const packageThumbnail = await this.extractPackageThumbnail(zip);

    // Get color palette from schemes or use defaults
    const palette = this.getColorPalette(colorSchemes);

    for (let i = 0; i < slideCount; i++) {
      const slideNumber = i + 1;
      const title = titles[i] || null;

      try {
        let thumbnailBuffer: Buffer | null = null;

        // For slide 1, try the package thumbnail
        if (slideNumber === 1 && packageThumbnail) {
          thumbnailBuffer = await this.resizeImage(
            packageThumbnail,
            THUMBNAIL_WIDTH,
            THUMBNAIL_HEIGHT,
          );
        }

        // Try to extract an embedded image for this slide
        if (!thumbnailBuffer) {
          const embeddedImage = await this.extractSlideEmbeddedImage(zip, slideNumber);
          if (embeddedImage) {
            thumbnailBuffer = await this.resizeImage(
              embeddedImage,
              THUMBNAIL_WIDTH,
              THUMBNAIL_HEIGHT,
            );
          }
        }

        // Fallback: generate a placeholder thumbnail
        if (!thumbnailBuffer) {
          thumbnailBuffer = await this.generatePlaceholderThumbnail(
            slideNumber,
            title || `Slide ${slideNumber}`,
            THUMBNAIL_WIDTH,
            THUMBNAIL_HEIGHT,
            palette,
          );
        }

        // Upload thumbnail
        const thumbnailKey = `presentations/${presentationId}/thumbnails/slide-${slideNumber}-${nanoid(8)}.png`;
        const thumbnailUpload = await this.storageStrategy.upload(
          thumbnailBuffer,
          thumbnailKey,
          'image/png',
        );

        // Generate larger preview image
        let previewUrl: string | null = null;
        let previewKey: string | null = null;

        try {
          const previewBuffer = await this.generatePlaceholderThumbnail(
            slideNumber,
            title || `Slide ${slideNumber}`,
            PREVIEW_WIDTH,
            PREVIEW_HEIGHT,
            palette,
          );

          const pKey = `presentations/${presentationId}/previews/slide-${slideNumber}-${nanoid(8)}.png`;
          const previewUpload = await this.storageStrategy.upload(
            previewBuffer,
            pKey,
            'image/png',
          );

          previewUrl = previewUpload.url;
          previewKey = pKey;
        } catch (err) {
          this.logger.warn(
            `Failed to generate preview for slide ${slideNumber}: ${err instanceof Error ? err.message : String(err)}`,
          );
        }

        results.push({
          slideNumber,
          thumbnailUrl: thumbnailUpload.url,
          thumbnailKey,
          previewUrl,
          previewKey,
          width: THUMBNAIL_WIDTH,
          height: THUMBNAIL_HEIGHT,
        });
      } catch (err) {
        this.logger.error(
          `Failed to generate thumbnail for slide ${slideNumber}: ${err instanceof Error ? err.message : String(err)}`,
        );

        // Generate a minimal fallback and upload it
        try {
          const fallbackBuffer = await this.generateMinimalPlaceholder(
            slideNumber,
            THUMBNAIL_WIDTH,
            THUMBNAIL_HEIGHT,
          );

          const fallbackKey = `presentations/${presentationId}/thumbnails/slide-${slideNumber}-fallback-${nanoid(8)}.png`;
          const fallbackUpload = await this.storageStrategy.upload(
            fallbackBuffer,
            fallbackKey,
            'image/png',
          );

          results.push({
            slideNumber,
            thumbnailUrl: fallbackUpload.url,
            thumbnailKey: fallbackKey,
            previewUrl: null,
            previewKey: null,
            width: THUMBNAIL_WIDTH,
            height: THUMBNAIL_HEIGHT,
          });
        } catch (uploadErr) {
          this.logger.error(
            `Failed to upload fallback thumbnail for slide ${slideNumber}: ${uploadErr instanceof Error ? uploadErr.message : String(uploadErr)}`,
          );
        }
      }
    }

    return results;
  }

  async generatePlaceholderThumbnail(
    slideNumber: number,
    title: string,
    width: number,
    height: number,
    colorScheme: string[],
  ): Promise<Buffer> {
    const bgColor = colorScheme[(slideNumber - 1) % colorScheme.length];
    const textColor = this.getContrastColor(bgColor);

    // Truncate title for display
    const displayTitle = title.length > 60 ? title.substring(0, 57) + '...' : title;

    // Escape XML special characters
    const escapedTitle = this.escapeXml(displayTitle);

    // Calculate font sizes relative to dimensions
    const titleFontSize = Math.max(Math.floor(width / 20), 14);
    const numberFontSize = Math.max(Math.floor(width / 30), 10);

    // Wrap title text to multiple lines if needed
    const maxCharsPerLine = Math.floor(width / (titleFontSize * 0.55));
    const titleLines = this.wrapText(escapedTitle, maxCharsPerLine);
    const titleLinesXml = titleLines
      .map((line, idx) => {
        const y = height / 2 - ((titleLines.length - 1) * titleFontSize * 1.3) / 2 + idx * titleFontSize * 1.3;
        return `<text x="${width / 2}" y="${y}" font-family="Arial, Helvetica, sans-serif" font-size="${titleFontSize}" fill="${textColor}" text-anchor="middle" dominant-baseline="central">${line}</text>`;
      })
      .join('\n    ');

    const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${this.darkenColor(bgColor, 30)};stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)" rx="4" ry="4"/>
  <rect x="${width - 50}" y="10" width="40" height="28" rx="4" ry="4" fill="rgba(0,0,0,0.3)"/>
  <text x="${width - 30}" y="28" font-family="Arial, Helvetica, sans-serif" font-size="${numberFontSize}" fill="white" text-anchor="middle" dominant-baseline="central">${slideNumber}</text>
  ${titleLinesXml}
  <line x1="${width * 0.2}" y1="${height - 30}" x2="${width * 0.8}" y2="${height - 30}" stroke="${textColor}" stroke-opacity="0.3" stroke-width="1"/>
</svg>`;

    return sharp(Buffer.from(svg))
      .png({ quality: 90 })
      .toBuffer();
  }

  async deleteThumbnails(keys: string[]): Promise<void> {
    const deletePromises = keys.map(async (key) => {
      try {
        await this.storageStrategy.delete(key);
      } catch (err) {
        this.logger.warn(
          `Failed to delete thumbnail ${key}: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    });

    await Promise.all(deletePromises);
  }

  // ──────────────────────────────────────────────
  //  Image extraction from PPTX
  // ──────────────────────────────────────────────

  private async extractPackageThumbnail(zip: JSZip): Promise<Buffer | null> {
    // Try common thumbnail locations
    const thumbnailPaths = [
      'docProps/thumbnail.jpeg',
      'docProps/thumbnail.png',
      'docProps/thumbnail.jpg',
    ];

    for (const thumbPath of thumbnailPaths) {
      const file = zip.file(thumbPath);
      if (file) {
        try {
          const data = await file.async('nodebuffer');
          // Validate it's a real image by checking with sharp
          await sharp(data).metadata();
          return data;
        } catch {
          continue;
        }
      }
    }

    return null;
  }

  private async extractSlideEmbeddedImage(
    zip: JSZip,
    slideNumber: number,
  ): Promise<Buffer | null> {
    try {
      // Read the slide relationship file to find image references
      const relsPath = `ppt/slides/_rels/slide${slideNumber}.xml.rels`;
      const relsFile = zip.file(relsPath);
      if (!relsFile) return null;

      const relsXml = await relsFile.async('string');

      // Find image relationships
      const imagePattern = /Target="\.\.\/media\/(image\d+\.\w+)"/g;
      let match: RegExpExecArray | null;
      const imageFiles: string[] = [];

      while ((match = imagePattern.exec(relsXml)) !== null) {
        imageFiles.push(`ppt/media/${match[1]}`);
      }

      // Try to use the first image found as a representative thumbnail
      for (const imageFile of imageFiles) {
        const file = zip.file(imageFile);
        if (!file) continue;

        try {
          const data = await file.async('nodebuffer');
          const metadata = await sharp(data).metadata();

          // Only use images that are reasonably large (likely content images, not icons)
          if (metadata.width && metadata.height && metadata.width >= 200 && metadata.height >= 150) {
            return data;
          }
        } catch {
          continue;
        }
      }

      return null;
    } catch {
      return null;
    }
  }

  // ──────────────────────────────────────────────
  //  Utility methods
  // ──────────────────────────────────────────────

  private async resizeImage(
    buffer: Buffer,
    width: number,
    height: number,
  ): Promise<Buffer> {
    return sharp(buffer)
      .resize(width, height, { fit: 'cover' })
      .png({ quality: 90 })
      .toBuffer();
  }

  private async generateMinimalPlaceholder(
    slideNumber: number,
    width: number,
    height: number,
  ): Promise<Buffer> {
    const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="#E5E7EB" rx="4" ry="4"/>
  <text x="${width / 2}" y="${height / 2}" font-family="Arial, Helvetica, sans-serif" font-size="24" fill="#9CA3AF" text-anchor="middle" dominant-baseline="central">Slide ${slideNumber}</text>
</svg>`;

    return sharp(Buffer.from(svg))
      .png({ quality: 80 })
      .toBuffer();
  }

  private getColorPalette(colorSchemes?: { name: string; colors: string[] }[]): string[] {
    if (colorSchemes && colorSchemes.length > 0) {
      // Use accent colors from the first scheme (skip dk1/lt1/dk2/lt2, take accent1-6)
      const scheme = colorSchemes[0];
      if (scheme.colors.length >= 6) {
        // Positions 4-9 are typically accent1-accent6
        return scheme.colors.slice(4, 10).filter(Boolean);
      }
      if (scheme.colors.length > 0) {
        return scheme.colors;
      }
    }

    return DEFAULT_COLORS;
  }

  private getContrastColor(hexColor: string): string {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Relative luminance calculation
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    return luminance > 0.5 ? '#1F2937' : '#FFFFFF';
  }

  private darkenColor(hexColor: string, percent: number): string {
    const hex = hexColor.replace('#', '');
    const r = Math.max(0, parseInt(hex.substring(0, 2), 16) - percent);
    const g = Math.max(0, parseInt(hex.substring(2, 4), 16) - percent);
    const b = Math.max(0, parseInt(hex.substring(4, 6), 16) - percent);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private wrapText(text: string, maxCharsPerLine: number): string[] {
    if (text.length <= maxCharsPerLine) return [text];

    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      if ((currentLine + ' ' + word).trim().length > maxCharsPerLine) {
        if (currentLine.length > 0) {
          lines.push(currentLine.trim());
        }
        currentLine = word;
      } else {
        currentLine = (currentLine + ' ' + word).trim();
      }
    }

    if (currentLine.length > 0) {
      lines.push(currentLine.trim());
    }

    // Limit to 3 lines max
    if (lines.length > 3) {
      lines.length = 3;
      lines[2] = lines[2].substring(0, lines[2].length - 3) + '...';
    }

    return lines;
  }
}
