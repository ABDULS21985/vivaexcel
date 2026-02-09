import { Injectable, Logger } from '@nestjs/common';
import JSZip from 'jszip';
import { XMLParser } from 'fast-xml-parser';
import { AspectRatio, SlideContentType } from '../enums/presentation.enums';
import { ColorScheme } from '../../../entities/presentation.entity';

// ──────────────────────────────────────────────
//  Result interfaces
// ──────────────────────────────────────────────

export interface PptxMetadata {
  slideCount: number;
  aspectRatio: AspectRatio;
  fontFamilies: string[];
  hasAnimations: boolean;
  hasTransitions: boolean;
  hasSpeakerNotes: boolean;
  hasCharts: boolean;
  hasImages: boolean;
  masterSlideCount: number;
  layoutCount: number;
  colorSchemes: ColorScheme[];
  softwareCompatibility: string[];
  presentationSize: string | null;
}

export interface SlideInfo {
  slideNumber: number;
  title: string | null;
  hasNotes: boolean;
  notesPreview: string | null;
  contentType: SlideContentType;
}

// ──────────────────────────────────────────────
//  XML namespace-aware helper types
// ──────────────────────────────────────────────

const XML_PARSER_OPTIONS = {
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  removeNSPrefix: true,
  isArray: (name: string) => {
    const alwaysArray = [
      'sldId', 'sldMasterId', 'sldLayoutId',
      'sp', 'pic', 'graphicFrame', 'tbl',
      'cTn', 'anim', 'animEffect', 'set', 'animMotion',
      'majorFont', 'minorFont', 'font',
      'dk1', 'lt1', 'dk2', 'lt2', 'accent1', 'accent2',
      'accent3', 'accent4', 'accent5', 'accent6',
      'r', 't', 'p',
      'transition',
    ];
    return alwaysArray.includes(name);
  },
};

@Injectable()
export class PptxProcessorService {
  private readonly logger = new Logger(PptxProcessorService.name);
  private readonly parser = new XMLParser(XML_PARSER_OPTIONS);

  // ──────────────────────────────────────────────
  //  Public API
  // ──────────────────────────────────────────────

  async extractMetadata(buffer: Buffer): Promise<PptxMetadata> {
    const zip = await JSZip.loadAsync(buffer);

    const [
      slideCount,
      aspectRatio,
      presentationSize,
      fontFamilies,
      colorSchemes,
      hasAnimations,
      hasTransitions,
      hasSpeakerNotes,
      hasCharts,
      hasImages,
      masterSlideCount,
      layoutCount,
    ] = await Promise.all([
      this.countSlides(zip),
      this.extractAspectRatio(zip),
      this.extractPresentationSize(zip),
      this.extractFontFamilies(zip),
      this.extractColorSchemes(zip),
      this.detectAnimations(zip),
      this.detectTransitions(zip),
      this.detectSpeakerNotes(zip),
      this.detectCharts(zip),
      this.detectImages(zip),
      this.countMasterSlides(zip),
      this.countSlideLayouts(zip),
    ]);

    const softwareCompatibility = this.determineSoftwareCompatibility({
      hasAnimations,
      hasTransitions,
      hasCharts,
    });

    return {
      slideCount,
      aspectRatio,
      presentationSize,
      fontFamilies,
      colorSchemes,
      hasAnimations,
      hasTransitions,
      hasSpeakerNotes,
      hasCharts,
      hasImages,
      masterSlideCount,
      layoutCount,
      softwareCompatibility,
    };
  }

  async extractSlideInfo(buffer: Buffer): Promise<SlideInfo[]> {
    const zip = await JSZip.loadAsync(buffer);
    const slideFiles = this.getSlideFiles(zip);
    const results: SlideInfo[] = [];

    for (let i = 0; i < slideFiles.length; i++) {
      const slideNumber = i + 1;
      try {
        const slideInfo = await this.parseSlideInfo(zip, slideFiles[i], slideNumber);
        results.push(slideInfo);
      } catch (err) {
        this.logger.warn(
          `Failed to parse slide ${slideNumber}: ${err instanceof Error ? err.message : String(err)}`,
        );
        results.push({
          slideNumber,
          title: null,
          hasNotes: false,
          notesPreview: null,
          contentType: SlideContentType.CONTENT,
        });
      }
    }

    return results;
  }

  // ──────────────────────────────────────────────
  //  Slide counting
  // ──────────────────────────────────────────────

  private getSlideFiles(zip: JSZip): string[] {
    const slideFiles: string[] = [];
    zip.forEach((relativePath: string) => {
      if (/^ppt\/slides\/slide\d+\.xml$/.test(relativePath)) {
        slideFiles.push(relativePath);
      }
    });

    // Sort by slide number
    slideFiles.sort((a, b) => {
      const numA = parseInt(a.match(/slide(\d+)\.xml/)![1], 10);
      const numB = parseInt(b.match(/slide(\d+)\.xml/)![1], 10);
      return numA - numB;
    });

    return slideFiles;
  }

  private async countSlides(zip: JSZip): Promise<number> {
    return this.getSlideFiles(zip).length;
  }

  // ──────────────────────────────────────────────
  //  Aspect ratio
  // ──────────────────────────────────────────────

  private async extractAspectRatio(zip: JSZip): Promise<AspectRatio> {
    try {
      const presentationXml = await this.readZipFile(zip, 'ppt/presentation.xml');
      if (!presentationXml) return AspectRatio.WIDESCREEN;

      const parsed = this.parser.parse(presentationXml);
      const sldSz =
        parsed?.presentation?.sldSz ??
        parsed?.Presentation?.sldSz ??
        null;

      if (!sldSz) return AspectRatio.WIDESCREEN;

      // Values are in EMU (English Metric Units). 1 inch = 914400 EMU.
      const cx = parseInt(sldSz['@_cx'] || '0', 10);
      const cy = parseInt(sldSz['@_cy'] || '0', 10);

      if (cx === 0 || cy === 0) return AspectRatio.WIDESCREEN;

      const ratio = cx / cy;

      // 16:9 = 1.778, 4:3 = 1.333
      if (Math.abs(ratio - 16 / 9) < 0.05) return AspectRatio.WIDESCREEN;
      if (Math.abs(ratio - 4 / 3) < 0.05) return AspectRatio.STANDARD;

      // Check for A4 portrait/landscape (210mm x 297mm)
      // A4 landscape EMU: cx = 10692000, cy = 7560000 -> ratio ~1.414
      if (Math.abs(ratio - 297 / 210) < 0.05 || Math.abs(ratio - 210 / 297) < 0.05) {
        return AspectRatio.A4;
      }

      // Check for US Letter (11 x 8.5)
      // Letter landscape EMU: cx = 10058400, cy = 7772400 -> ratio ~1.294
      if (Math.abs(ratio - 11 / 8.5) < 0.05 || Math.abs(ratio - 8.5 / 11) < 0.05) {
        return AspectRatio.LETTER;
      }

      return AspectRatio.CUSTOM;
    } catch (err) {
      this.logger.warn(
        `Failed to extract aspect ratio: ${err instanceof Error ? err.message : String(err)}`,
      );
      return AspectRatio.WIDESCREEN;
    }
  }

  // ──────────────────────────────────────────────
  //  Presentation size (dimensions string)
  // ──────────────────────────────────────────────

  private async extractPresentationSize(zip: JSZip): Promise<string | null> {
    try {
      const presentationXml = await this.readZipFile(zip, 'ppt/presentation.xml');
      if (!presentationXml) return null;

      const parsed = this.parser.parse(presentationXml);
      const sldSz =
        parsed?.presentation?.sldSz ??
        parsed?.Presentation?.sldSz ??
        null;

      if (!sldSz) return null;

      const cx = parseInt(sldSz['@_cx'] || '0', 10);
      const cy = parseInt(sldSz['@_cy'] || '0', 10);

      if (cx === 0 || cy === 0) return null;

      // Convert EMU to inches (1 inch = 914400 EMU)
      const widthInches = (cx / 914400).toFixed(2);
      const heightInches = (cy / 914400).toFixed(2);

      return `${widthInches}" x ${heightInches}"`;
    } catch (err) {
      this.logger.warn(
        `Failed to extract presentation size: ${err instanceof Error ? err.message : String(err)}`,
      );
      return null;
    }
  }

  // ──────────────────────────────────────────────
  //  Font families
  // ──────────────────────────────────────────────

  private async extractFontFamilies(zip: JSZip): Promise<string[]> {
    const fonts = new Set<string>();

    try {
      // Extract from theme
      const themeXml = await this.readZipFile(zip, 'ppt/theme/theme1.xml');
      if (themeXml) {
        this.extractFontsFromTheme(themeXml, fonts);
      }

      // Extract from slides (sample first 5 slides for performance)
      const slideFiles = this.getSlideFiles(zip);
      const sampled = slideFiles.slice(0, 5);

      for (const slideFile of sampled) {
        const slideXml = await this.readZipFile(zip, slideFile);
        if (slideXml) {
          this.extractFontsFromSlide(slideXml, fonts);
        }
      }
    } catch (err) {
      this.logger.warn(
        `Failed to extract fonts: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    return Array.from(fonts).filter(Boolean).sort();
  }

  private extractFontsFromTheme(xml: string, fonts: Set<string>): void {
    try {
      const parsed = this.parser.parse(xml);
      const theme = parsed?.theme ?? parsed?.Theme ?? {};
      const themeElements = theme?.themeElements ?? {};
      const fontScheme = themeElements?.fontScheme ?? {};

      // Major and minor font families
      const majorFont = fontScheme?.majorFont;
      const minorFont = fontScheme?.minorFont;

      if (majorFont?.latin?.['@_typeface']) {
        fonts.add(majorFont.latin['@_typeface']);
      }
      if (minorFont?.latin?.['@_typeface']) {
        fonts.add(minorFont.latin['@_typeface']);
      }

      // East Asian and complex script fonts
      if (majorFont?.ea?.['@_typeface']) fonts.add(majorFont.ea['@_typeface']);
      if (majorFont?.cs?.['@_typeface']) fonts.add(majorFont.cs['@_typeface']);
      if (minorFont?.ea?.['@_typeface']) fonts.add(minorFont.ea['@_typeface']);
      if (minorFont?.cs?.['@_typeface']) fonts.add(minorFont.cs['@_typeface']);
    } catch {
      // Silently skip malformed theme XML
    }
  }

  private extractFontsFromSlide(xml: string, fonts: Set<string>): void {
    try {
      // Fast regex approach for font extraction from slide XML
      const fontMatches = xml.match(/typeface="([^"]+)"/g);
      if (fontMatches) {
        for (const match of fontMatches) {
          const font = match.replace('typeface="', '').replace('"', '');
          // Skip theme-reference fonts like "+mj-lt", "+mn-lt"
          if (!font.startsWith('+')) {
            fonts.add(font);
          }
        }
      }
    } catch {
      // Silently skip malformed slide XML
    }
  }

  // ──────────────────────────────────────────────
  //  Color scheme extraction
  // ──────────────────────────────────────────────

  private async extractColorSchemes(zip: JSZip): Promise<ColorScheme[]> {
    const schemes: ColorScheme[] = [];

    try {
      // Check all theme files
      const themeFiles: string[] = [];
      zip.forEach((relativePath: string) => {
        if (/^ppt\/theme\/theme\d+\.xml$/.test(relativePath)) {
          themeFiles.push(relativePath);
        }
      });

      for (const themeFile of themeFiles) {
        const themeXml = await this.readZipFile(zip, themeFile);
        if (!themeXml) continue;

        const scheme = this.extractColorsFromTheme(themeXml, themeFile);
        if (scheme) {
          schemes.push(scheme);
        }
      }
    } catch (err) {
      this.logger.warn(
        `Failed to extract color schemes: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    return schemes;
  }

  private extractColorsFromTheme(xml: string, fileName: string): ColorScheme | null {
    try {
      const parsed = this.parser.parse(xml);
      const theme = parsed?.theme ?? parsed?.Theme ?? {};
      const themeElements = theme?.themeElements ?? {};
      const clrScheme = themeElements?.clrScheme ?? {};

      const colors: string[] = [];
      const colorSlots = [
        'dk1', 'lt1', 'dk2', 'lt2',
        'accent1', 'accent2', 'accent3', 'accent4', 'accent5', 'accent6',
        'hlink', 'folHlink',
      ];

      for (const slot of colorSlots) {
        const colorNode = clrScheme[slot];
        if (!colorNode) continue;

        // Color can be srgbClr, sysClr, etc.
        const srgb = colorNode?.srgbClr;
        const sys = colorNode?.sysClr;

        if (srgb) {
          const val = typeof srgb === 'object' ? srgb['@_val'] : srgb;
          if (val) colors.push(`#${val}`);
        } else if (sys) {
          const lastClr = typeof sys === 'object' ? sys['@_lastClr'] : null;
          if (lastClr) colors.push(`#${lastClr}`);
        }
      }

      if (colors.length === 0) return null;

      const schemeName = clrScheme['@_name'] || fileName.replace(/^ppt\/theme\//, '').replace('.xml', '');

      return {
        name: schemeName,
        colors,
      };
    } catch {
      return null;
    }
  }

  // ──────────────────────────────────────────────
  //  Feature detection
  // ──────────────────────────────────────────────

  private async detectAnimations(zip: JSZip): Promise<boolean> {
    try {
      const slideFiles = this.getSlideFiles(zip);

      for (const slideFile of slideFiles) {
        const slideXml = await this.readZipFile(zip, slideFile);
        if (!slideXml) continue;

        // Look for animation elements: <p:timing>, <p:anim>, <p:animEffect>, <p:set>, <p:animMotion>
        if (
          slideXml.includes('<p:timing') ||
          slideXml.includes('<p:anim') ||
          slideXml.includes('<p:animEffect') ||
          slideXml.includes('<p:animMotion') ||
          slideXml.includes('<p:seq')
        ) {
          return true;
        }
      }

      return false;
    } catch (err) {
      this.logger.warn(
        `Failed to detect animations: ${err instanceof Error ? err.message : String(err)}`,
      );
      return false;
    }
  }

  private async detectTransitions(zip: JSZip): Promise<boolean> {
    try {
      const slideFiles = this.getSlideFiles(zip);

      for (const slideFile of slideFiles) {
        const slideXml = await this.readZipFile(zip, slideFile);
        if (!slideXml) continue;

        // Look for transition elements: <p:transition>, <mc:AlternateContent> with transitions
        if (
          slideXml.includes('<p:transition') ||
          slideXml.includes('<p14:transition') ||
          slideXml.includes(':transition')
        ) {
          return true;
        }
      }

      return false;
    } catch (err) {
      this.logger.warn(
        `Failed to detect transitions: ${err instanceof Error ? err.message : String(err)}`,
      );
      return false;
    }
  }

  private async detectSpeakerNotes(zip: JSZip): Promise<boolean> {
    let hasNotes = false;

    zip.forEach((relativePath: string) => {
      if (/^ppt\/notesSlides\/notesSlide\d+\.xml$/.test(relativePath)) {
        hasNotes = true;
      }
    });

    return hasNotes;
  }

  private async detectCharts(zip: JSZip): Promise<boolean> {
    let hasCharts = false;

    zip.forEach((relativePath: string) => {
      if (/^ppt\/charts\/chart\d+\.xml$/.test(relativePath)) {
        hasCharts = true;
      }
    });

    return hasCharts;
  }

  private async detectImages(zip: JSZip): Promise<boolean> {
    let hasImages = false;

    zip.forEach((relativePath: string) => {
      if (/^ppt\/media\//.test(relativePath)) {
        const ext = relativePath.toLowerCase().split('.').pop();
        if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg', 'tiff', 'emf', 'wmf'].includes(ext || '')) {
          hasImages = true;
        }
      }
    });

    return hasImages;
  }

  // ──────────────────────────────────────────────
  //  Master slides & layouts
  // ──────────────────────────────────────────────

  private async countMasterSlides(zip: JSZip): Promise<number> {
    let count = 0;
    zip.forEach((relativePath: string) => {
      if (/^ppt\/slideMasters\/slideMaster\d+\.xml$/.test(relativePath)) {
        count++;
      }
    });
    return count;
  }

  private async countSlideLayouts(zip: JSZip): Promise<number> {
    let count = 0;
    zip.forEach((relativePath: string) => {
      if (/^ppt\/slideLayouts\/slideLayout\d+\.xml$/.test(relativePath)) {
        count++;
      }
    });
    return count;
  }

  // ──────────────────────────────────────────────
  //  Slide info parsing
  // ──────────────────────────────────────────────

  private async parseSlideInfo(
    zip: JSZip,
    slideFile: string,
    slideNumber: number,
  ): Promise<SlideInfo> {
    const slideXml = await this.readZipFile(zip, slideFile);
    if (!slideXml) {
      return {
        slideNumber,
        title: null,
        hasNotes: false,
        notesPreview: null,
        contentType: SlideContentType.CONTENT,
      };
    }

    const parsed = this.parser.parse(slideXml);
    const title = this.extractSlideTitle(parsed);
    const contentType = this.detectSlideContentType(parsed, slideXml);

    // Check for corresponding notes slide
    const notesFile = `ppt/notesSlides/notesSlide${slideNumber}.xml`;
    const notesXml = await this.readZipFile(zip, notesFile);
    const hasNotes = notesXml !== null;
    const notesPreview = hasNotes ? this.extractNotesPreview(notesXml!) : null;

    return {
      slideNumber,
      title,
      hasNotes,
      notesPreview,
      contentType,
    };
  }

  private extractSlideTitle(parsed: Record<string, any>): string | null {
    try {
      const sld = parsed?.sld ?? {};
      const cSld = sld?.cSld ?? {};
      const spTree = cSld?.spTree ?? {};

      // Get all shape elements
      const shapes = this.normalizeToArray(spTree?.sp);

      for (const sp of shapes) {
        const nvSpPr = sp?.nvSpPr;
        const nvPr = nvSpPr?.nvPr;

        // Check for title placeholder (ph type="title" or ph type="ctrTitle")
        const ph = nvPr?.ph;
        if (ph) {
          const phType = ph['@_type'];
          if (phType === 'title' || phType === 'ctrTitle') {
            return this.extractTextFromShape(sp);
          }
        }
      }

      // Fallback: look for any shape with idx=0 (often the title)
      for (const sp of shapes) {
        const nvSpPr = sp?.nvSpPr;
        const nvPr = nvSpPr?.nvPr;
        const ph = nvPr?.ph;
        if (ph && ph['@_idx'] === '0') {
          return this.extractTextFromShape(sp);
        }
      }

      return null;
    } catch {
      return null;
    }
  }

  private extractTextFromShape(sp: Record<string, any>): string | null {
    try {
      const txBody = sp?.txBody;
      if (!txBody) return null;

      const paragraphs = this.normalizeToArray(txBody?.p);
      const textParts: string[] = [];

      for (const p of paragraphs) {
        const runs = this.normalizeToArray(p?.r);
        for (const r of runs) {
          const t = r?.t;
          if (t !== undefined && t !== null) {
            textParts.push(typeof t === 'string' ? t : String(t));
          }
        }
      }

      const text = textParts.join(' ').trim();
      return text.length > 0 ? text : null;
    } catch {
      return null;
    }
  }

  private extractNotesPreview(notesXml: string): string | null {
    try {
      const parsed = this.parser.parse(notesXml);
      const notes = parsed?.notes ?? {};
      const cSld = notes?.cSld ?? {};
      const spTree = cSld?.spTree ?? {};
      const shapes = this.normalizeToArray(spTree?.sp);

      const textParts: string[] = [];

      for (const sp of shapes) {
        const nvSpPr = sp?.nvSpPr;
        const nvPr = nvSpPr?.nvPr;
        const ph = nvPr?.ph;

        // Notes placeholder type is "body"
        if (ph && ph['@_type'] === 'body') {
          const txBody = sp?.txBody;
          if (!txBody) continue;

          const paragraphs = this.normalizeToArray(txBody?.p);
          for (const p of paragraphs) {
            const runs = this.normalizeToArray(p?.r);
            for (const r of runs) {
              const t = r?.t;
              if (t !== undefined && t !== null) {
                textParts.push(typeof t === 'string' ? t : String(t));
              }
            }
          }
        }
      }

      const text = textParts.join(' ').trim();
      if (text.length === 0) return null;

      // Limit to 200 characters
      return text.length > 200 ? text.substring(0, 200) + '...' : text;
    } catch {
      return null;
    }
  }

  // ──────────────────────────────────────────────
  //  Content type detection
  // ──────────────────────────────────────────────

  private detectSlideContentType(
    parsed: Record<string, any>,
    rawXml: string,
  ): SlideContentType {
    try {
      const sld = parsed?.sld ?? {};
      const cSld = sld?.cSld ?? {};
      const spTree = cSld?.spTree ?? {};

      const shapes = this.normalizeToArray(spTree?.sp);
      const graphicFrames = this.normalizeToArray(spTree?.graphicFrame);
      const pictures = this.normalizeToArray(spTree?.pic);

      // Check for charts (graphicFrame elements with chart references)
      if (rawXml.includes('chart') && graphicFrames.length > 0) {
        return SlideContentType.CHART;
      }

      // Check for tables
      const hasTable = graphicFrames.some((gf: Record<string, any>) => {
        const graphic = gf?.graphic;
        const graphicData = graphic?.graphicData;
        return graphicData?.tbl !== undefined;
      });
      if (hasTable || rawXml.includes('<a:tbl')) {
        return SlideContentType.TABLE;
      }

      // Analyze placeholders to detect slide type
      let hasTitle = false;
      let hasSubtitle = false;
      let hasBody = false;
      let bodyCount = 0;

      for (const sp of shapes) {
        const ph = sp?.nvSpPr?.nvPr?.ph;
        if (!ph) continue;

        const phType = ph['@_type'];
        if (phType === 'title' || phType === 'ctrTitle') hasTitle = true;
        if (phType === 'subTitle') hasSubtitle = true;
        if (phType === 'body') {
          hasBody = true;
          bodyCount++;
        }
      }

      // Title slide (title + subtitle, no body content)
      if ((hasTitle || hasSubtitle) && !hasBody && pictures.length === 0) {
        return SlideContentType.TITLE;
      }

      // Section header (title placeholder only, no body)
      if (hasTitle && !hasBody && !hasSubtitle && shapes.length <= 2) {
        return SlideContentType.SECTION_HEADER;
      }

      // Two column layout (two body placeholders)
      if (bodyCount >= 2) {
        return SlideContentType.TWO_COLUMN;
      }

      // Image-heavy slide (more pictures than text shapes)
      if (pictures.length > 0 && pictures.length >= shapes.length) {
        return SlideContentType.IMAGE;
      }

      // Blank slide (no shapes with content)
      if (shapes.length === 0 && pictures.length === 0 && graphicFrames.length === 0) {
        return SlideContentType.BLANK;
      }

      return SlideContentType.CONTENT;
    } catch {
      return SlideContentType.CONTENT;
    }
  }

  // ──────────────────────────────────────────────
  //  Software compatibility
  // ──────────────────────────────────────────────

  private determineSoftwareCompatibility(features: {
    hasAnimations: boolean;
    hasTransitions: boolean;
    hasCharts: boolean;
  }): string[] {
    const compatibility = [
      'Microsoft PowerPoint 2016+',
      'Microsoft PowerPoint 365',
    ];

    // Google Slides has limited animation and transition support
    if (!features.hasAnimations && !features.hasTransitions) {
      compatibility.push('Google Slides');
    } else {
      compatibility.push('Google Slides (partial)');
    }

    // LibreOffice Impress
    compatibility.push('LibreOffice Impress');

    // Apple Keynote (import)
    compatibility.push('Apple Keynote (import)');

    // WPS Office
    compatibility.push('WPS Office');

    return compatibility;
  }

  // ──────────────────────────────────────────────
  //  Utilities
  // ──────────────────────────────────────────────

  private async readZipFile(zip: JSZip, path: string): Promise<string | null> {
    const file = zip.file(path);
    if (!file) return null;

    try {
      return await file.async('string');
    } catch {
      return null;
    }
  }

  private normalizeToArray(value: unknown): Record<string, any>[] {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return [value as Record<string, any>];
  }
}
