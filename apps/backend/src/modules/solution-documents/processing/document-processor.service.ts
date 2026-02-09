import { Injectable, Logger } from '@nestjs/common';
import JSZip from 'jszip';
import { XMLParser } from 'fast-xml-parser';
import { TableOfContentsItem } from '../../../entities/solution-document.entity';

// ──────────────────────────────────────────────
//  Result interfaces
// ──────────────────────────────────────────────

export interface DocumentMetadata {
  pageCount: number;
  wordCount: number;
  diagramCount: number;
  headings: { level: number; title: string; pageNumber?: number }[];
  author?: string;
  title?: string;
  description?: string;
  keywords?: string[];
  extractedText?: string; // First N characters for AI analysis
}

// ──────────────────────────────────────────────
//  Constants
// ──────────────────────────────────────────────

const EXTRACTED_TEXT_LIMIT = 5000; // Max characters for extracted text preview
const WORDS_PER_PAGE_ESTIMATE = 300; // Average words per page for page count estimation

const XML_PARSER_OPTIONS = {
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  removeNSPrefix: true,
  isArray: (name: string) => {
    const alwaysArray = [
      'p', 'r', 't', 'hyperlink',
      'tbl', 'tr', 'tc',
      'drawing', 'inline', 'anchor',
    ];
    return alwaysArray.includes(name);
  },
};

// Technology keywords for detection
const TECHNOLOGY_KEYWORDS: Record<string, RegExp> = {
  // Cloud platforms
  'AWS': /\bAWS\b|Amazon Web Services/i,
  'Azure': /\bAzure\b|Microsoft Azure/i,
  'GCP': /\bGCP\b|Google Cloud Platform|Google Cloud/i,
  'Oracle Cloud': /\bOracle Cloud\b|OCI\b/i,
  'IBM Cloud': /\bIBM Cloud\b/i,

  // Containers & orchestration
  'Docker': /\bDocker\b/i,
  'Kubernetes': /\bKubernetes\b|K8s\b/i,
  'Terraform': /\bTerraform\b/i,
  'Ansible': /\bAnsible\b/i,
  'Helm': /\bHelm\b/i,

  // Databases
  'PostgreSQL': /\bPostgreSQL\b|Postgres\b/i,
  'MySQL': /\bMySQL\b/i,
  'MongoDB': /\bMongoDB\b/i,
  'Redis': /\bRedis\b/i,
  'DynamoDB': /\bDynamoDB\b/i,
  'Elasticsearch': /\bElasticsearch\b|Elastic\b/i,

  // Languages & frameworks
  'React': /\bReact\b|ReactJS\b/i,
  'Angular': /\bAngular\b/i,
  'Vue.js': /\bVue\.js\b|VueJS\b|Vue\b/i,
  'Node.js': /\bNode\.js\b|NodeJS\b/i,
  'NestJS': /\bNestJS\b/i,
  'Python': /\bPython\b/i,
  'Java': /\bJava\b(?!Script)/i,
  '.NET': /\.NET\b|ASP\.NET\b|C#\b/i,
  'Go': /\bGolang\b|Go\s+(?:service|module|application)/i,
  'Rust': /\bRust\b/i,
  'TypeScript': /\bTypeScript\b/i,

  // Messaging & streaming
  'Kafka': /\bKafka\b/i,
  'RabbitMQ': /\bRabbitMQ\b/i,
  'SQS': /\bSQS\b|Simple Queue Service/i,

  // CI/CD
  'Jenkins': /\bJenkins\b/i,
  'GitHub Actions': /\bGitHub Actions\b/i,
  'GitLab CI': /\bGitLab CI\b/i,
  'CircleCI': /\bCircleCI\b/i,

  // Monitoring
  'Prometheus': /\bPrometheus\b/i,
  'Grafana': /\bGrafana\b/i,
  'Datadog': /\bDatadog\b/i,
  'New Relic': /\bNew Relic\b/i,

  // API & networking
  'GraphQL': /\bGraphQL\b/i,
  'REST API': /\bREST\s*API\b|RESTful/i,
  'gRPC': /\bgRPC\b/i,
  'Nginx': /\bNginx\b/i,
  'API Gateway': /\bAPI Gateway\b/i,

  // Serverless
  'Lambda': /\bLambda\b|AWS Lambda/i,
  'Serverless': /\bServerless\b/i,

  // Data
  'Spark': /\bApache Spark\b|Spark\b/i,
  'Airflow': /\bAirflow\b/i,
  'Snowflake': /\bSnowflake\b/i,
};

// Compliance framework patterns
const COMPLIANCE_PATTERNS: Record<string, RegExp> = {
  'SOC2': /\bSOC\s*2\b|SOC\s*II\b/i,
  'HIPAA': /\bHIPAA\b/i,
  'GDPR': /\bGDPR\b/i,
  'ISO27001': /\bISO\s*27001\b|ISO\/IEC\s*27001/i,
  'PCI-DSS': /\bPCI[\s-]*DSS\b|Payment Card Industry/i,
  'NIST': /\bNIST\b/i,
  'FedRAMP': /\bFedRAMP\b/i,
  'CCPA': /\bCCPA\b/i,
  'SOX': /\bSOX\b|Sarbanes[\s-]*Oxley/i,
  'FERPA': /\bFERPA\b/i,
  'FISMA': /\bFISMA\b/i,
  'ISO9001': /\bISO\s*9001\b/i,
  'ITIL': /\bITIL\b/i,
  'COBIT': /\bCOBIT\b/i,
};

// Diagram tool patterns
const DIAGRAM_PATTERNS: RegExp[] = [
  /\bVisio\b/i,
  /\bdraw\.io\b|drawio\b/i,
  /\bLucidchart\b/i,
  /\bMermaid\b/i,
  /\bPlantUML\b/i,
  /\bDiagrams?\.net\b/i,
  /embedded.*(?:diagram|chart|figure)/i,
  /\bfigure\s+\d+/i,
  /\bdiagram\s+\d+/i,
];

@Injectable()
export class DocumentProcessorService {
  private readonly logger = new Logger(DocumentProcessorService.name);
  private readonly parser = new XMLParser(XML_PARSER_OPTIONS);

  // ──────────────────────────────────────────────
  //  Public API
  // ──────────────────────────────────────────────

  /**
   * Extract metadata from a DOCX file buffer.
   * DOCX is a ZIP archive containing XML files.
   */
  async extractDocxMetadata(buffer: Buffer): Promise<DocumentMetadata> {
    const zip = await JSZip.loadAsync(buffer);

    const [coreProps, bodyText, headings, imageCount, diagramCount] =
      await Promise.all([
        this.extractCoreProperties(zip),
        this.extractDocxBodyText(zip),
        this.extractDocxHeadings(zip),
        this.countDocxImages(zip),
        this.countDocxDiagrams(zip),
      ]);

    const wordCount = this.countWords(bodyText);
    const pageCount = Math.max(1, Math.ceil(wordCount / WORDS_PER_PAGE_ESTIMATE));

    return {
      pageCount,
      wordCount,
      diagramCount: diagramCount + this.countDiagramReferencesInText(bodyText),
      headings,
      author: coreProps.author ?? undefined,
      title: coreProps.title ?? undefined,
      description: coreProps.description ?? undefined,
      keywords: coreProps.keywords,
      extractedText: bodyText.substring(0, EXTRACTED_TEXT_LIMIT) || undefined,
    };
  }

  /**
   * Extract metadata from a PDF file buffer.
   * Note: pdf-parse is not installed; this provides basic stub functionality.
   * Install pdf-parse for full PDF metadata extraction.
   */
  async extractPdfMetadata(buffer: Buffer): Promise<DocumentMetadata> {
    // Attempt dynamic import of pdf-parse (optional dependency)
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(buffer);

      const text: string = data.text || '';
      const wordCount = this.countWords(text);
      const headings = this.extractHeadingsFromPlainText(text);

      return {
        pageCount: data.numpages || 1,
        wordCount,
        diagramCount: this.countDiagramReferencesInText(text),
        headings,
        author: data.info?.Author ?? undefined,
        title: data.info?.Title ?? undefined,
        description: data.info?.Subject ?? undefined,
        keywords: data.info?.Keywords
          ? data.info.Keywords.split(/[,;]/).map((k: string) => k.trim()).filter(Boolean)
          : undefined,
        extractedText: text.substring(0, EXTRACTED_TEXT_LIMIT) || undefined,
      };
    } catch {
      this.logger.warn(
        'pdf-parse is not available. PDF metadata extraction is limited. ' +
        'Install pdf-parse for full PDF support: npm install pdf-parse',
      );

      // Return minimal metadata from PDF header
      return this.extractBasicPdfMetadata(buffer);
    }
  }

  /**
   * Generate a structured table of contents from extracted headings.
   */
  generateTableOfContents(
    headings: { level: number; title: string; pageNumber?: number }[],
  ): TableOfContentsItem[] {
    if (headings.length === 0) return [];

    const toc: TableOfContentsItem[] = [];
    const stack: { entry: TableOfContentsItem; level: number }[] = [];

    for (const heading of headings) {
      const entry: TableOfContentsItem = {
        title: heading.title,
        page: heading.pageNumber,
        children: [],
      };

      // Find the correct parent for this heading level
      while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
        stack.pop();
      }

      if (stack.length === 0) {
        // Top-level entry
        toc.push(entry);
      } else {
        // Nested under the last entry in the stack
        const parent = stack[stack.length - 1].entry;
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(entry);
      }

      stack.push({ entry, level: heading.level });
    }

    return toc;
  }

  /**
   * Detect technology keywords mentioned in the document text.
   */
  detectTechnologies(text: string): string[] {
    if (!text) return [];

    const detected: string[] = [];

    for (const [technology, pattern] of Object.entries(TECHNOLOGY_KEYWORDS)) {
      if (pattern.test(text)) {
        detected.push(technology);
      }
    }

    return detected.sort();
  }

  /**
   * Detect compliance framework mentions in the document text.
   */
  detectComplianceFrameworks(text: string): string[] {
    if (!text) return [];

    const detected: string[] = [];

    for (const [framework, pattern] of Object.entries(COMPLIANCE_PATTERNS)) {
      if (pattern.test(text)) {
        detected.push(framework);
      }
    }

    return detected.sort();
  }

  // ──────────────────────────────────────────────
  //  DOCX - Core properties extraction
  // ──────────────────────────────────────────────

  private async extractCoreProperties(zip: JSZip): Promise<{
    author: string | null;
    title: string | null;
    description: string | null;
    keywords: string[];
  }> {
    try {
      const coreXml = await this.readZipFile(zip, 'docProps/core.xml');
      if (!coreXml) {
        return { author: null, title: null, description: null, keywords: [] };
      }

      const parsed = this.parser.parse(coreXml);
      const cp = parsed?.coreProperties ?? parsed?.['cp:coreProperties'] ?? {};

      const author =
        this.extractTextValue(cp?.creator) ??
        this.extractTextValue(cp?.['dc:creator']) ??
        null;

      const title =
        this.extractTextValue(cp?.title) ??
        this.extractTextValue(cp?.['dc:title']) ??
        null;

      const description =
        this.extractTextValue(cp?.description) ??
        this.extractTextValue(cp?.['dc:description']) ??
        null;

      const keywordsRaw =
        this.extractTextValue(cp?.keywords) ??
        this.extractTextValue(cp?.['cp:keywords']) ??
        '';

      const keywords = keywordsRaw
        ? keywordsRaw.split(/[,;]/).map((k) => k.trim()).filter(Boolean)
        : [];

      return { author, title, description, keywords };
    } catch (err) {
      this.logger.warn(
        `Failed to extract core properties: ${err instanceof Error ? err.message : String(err)}`,
      );
      return { author: null, title: null, description: null, keywords: [] };
    }
  }

  // ──────────────────────────────────────────────
  //  DOCX - Body text extraction
  // ──────────────────────────────────────────────

  private async extractDocxBodyText(zip: JSZip): Promise<string> {
    try {
      const documentXml = await this.readZipFile(zip, 'word/document.xml');
      if (!documentXml) return '';

      const parsed = this.parser.parse(documentXml);
      const document = parsed?.document ?? {};
      const body = document?.body ?? {};

      return this.extractTextFromBody(body);
    } catch (err) {
      this.logger.warn(
        `Failed to extract DOCX body text: ${err instanceof Error ? err.message : String(err)}`,
      );
      return '';
    }
  }

  private extractTextFromBody(body: Record<string, any>): string {
    const paragraphs = this.normalizeToArray(body?.p);
    const textParts: string[] = [];

    for (const p of paragraphs) {
      const paragraphText = this.extractTextFromParagraph(p);
      if (paragraphText) {
        textParts.push(paragraphText);
      }
    }

    // Also extract text from tables
    const tables = this.normalizeToArray(body?.tbl);
    for (const tbl of tables) {
      const rows = this.normalizeToArray(tbl?.tr);
      for (const row of rows) {
        const cells = this.normalizeToArray(row?.tc);
        for (const cell of cells) {
          const cellParagraphs = this.normalizeToArray(cell?.p);
          for (const cp of cellParagraphs) {
            const cellText = this.extractTextFromParagraph(cp);
            if (cellText) {
              textParts.push(cellText);
            }
          }
        }
      }
    }

    return textParts.join('\n');
  }

  private extractTextFromParagraph(p: Record<string, any>): string {
    const runs = this.normalizeToArray(p?.r);
    const hyperlinks = this.normalizeToArray(p?.hyperlink);
    const textParts: string[] = [];

    for (const r of runs) {
      const t = r?.t;
      if (t !== undefined && t !== null) {
        const text = typeof t === 'object' ? (t['#text'] ?? String(t)) : String(t);
        textParts.push(text);
      }
    }

    // Also extract text from hyperlinks
    for (const hyperlink of hyperlinks) {
      const hlRuns = this.normalizeToArray(hyperlink?.r);
      for (const r of hlRuns) {
        const t = r?.t;
        if (t !== undefined && t !== null) {
          const text = typeof t === 'object' ? (t['#text'] ?? String(t)) : String(t);
          textParts.push(text);
        }
      }
    }

    return textParts.join('');
  }

  // ──────────────────────────────────────────────
  //  DOCX - Heading extraction
  // ──────────────────────────────────────────────

  private async extractDocxHeadings(
    zip: JSZip,
  ): Promise<{ level: number; title: string; pageNumber?: number }[]> {
    try {
      const documentXml = await this.readZipFile(zip, 'word/document.xml');
      if (!documentXml) return [];

      const parsed = this.parser.parse(documentXml);
      const document = parsed?.document ?? {};
      const body = document?.body ?? {};
      const paragraphs = this.normalizeToArray(body?.p);

      const headings: { level: number; title: string; pageNumber?: number }[] = [];
      let estimatedPage = 1;
      let wordsSoFar = 0;

      for (const p of paragraphs) {
        const pPr = p?.pPr;
        const pStyle = pPr?.pStyle;

        // Get style value - could be Heading1, Heading2, etc.
        const styleVal: string =
          (typeof pStyle === 'object' ? pStyle['@_val'] : pStyle) ?? '';

        const headingMatch = styleVal.match(/^Heading(\d+)$/i);

        if (headingMatch) {
          const level = parseInt(headingMatch[1], 10);
          const text = this.extractTextFromParagraph(p).trim();

          if (text) {
            // Estimate page number based on word count
            estimatedPage = Math.max(1, Math.ceil(wordsSoFar / WORDS_PER_PAGE_ESTIMATE));

            headings.push({
              level,
              title: text,
              pageNumber: estimatedPage,
            });
          }
        }

        // Count words in this paragraph for page estimation
        const paraText = this.extractTextFromParagraph(p);
        wordsSoFar += this.countWords(paraText);
      }

      return headings;
    } catch (err) {
      this.logger.warn(
        `Failed to extract headings: ${err instanceof Error ? err.message : String(err)}`,
      );
      return [];
    }
  }

  // ──────────────────────────────────────────────
  //  DOCX - Image & diagram counting
  // ──────────────────────────────────────────────

  private async countDocxImages(zip: JSZip): Promise<number> {
    let count = 0;

    zip.forEach((relativePath: string) => {
      if (/^word\/media\//.test(relativePath)) {
        const ext = relativePath.toLowerCase().split('.').pop();
        if (
          ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg', 'tiff', 'emf', 'wmf'].includes(
            ext || '',
          )
        ) {
          count++;
        }
      }
    });

    return count;
  }

  private async countDocxDiagrams(zip: JSZip): Promise<number> {
    let count = 0;

    zip.forEach((relativePath: string) => {
      // Check for embedded Visio files
      if (/\.vsdx?$/i.test(relativePath)) {
        count++;
      }
      // Check for draw.io / diagrams.net embedded files
      if (/\.drawio$/i.test(relativePath)) {
        count++;
      }
      // Check for diagram XML parts (Word diagram smart art)
      if (/^word\/diagrams\//.test(relativePath)) {
        count++;
      }
      // Check for embedded chart parts
      if (/^word\/charts\//.test(relativePath)) {
        count++;
      }
    });

    return count;
  }

  private countDiagramReferencesInText(text: string): number {
    let count = 0;
    for (const pattern of DIAGRAM_PATTERNS) {
      const matches = text.match(new RegExp(pattern.source, pattern.flags + 'g'));
      if (matches) {
        count += matches.length;
      }
    }
    // Avoid double-counting by capping at a reasonable number
    return Math.min(count, 50);
  }

  // ──────────────────────────────────────────────
  //  PDF - Basic metadata (fallback without pdf-parse)
  // ──────────────────────────────────────────────

  private extractBasicPdfMetadata(buffer: Buffer): DocumentMetadata {
    try {
      // Read basic info from PDF header
      const header = buffer.subarray(0, Math.min(buffer.length, 4096)).toString('latin1');

      // Count pages by looking for "/Type /Page" occurrences in the full buffer
      // This is a rough estimate from the raw PDF data
      const fullContent = buffer.toString('latin1');
      const pageMatches = fullContent.match(/\/Type\s*\/Page[^s]/g);
      const pageCount = pageMatches ? pageMatches.length : 1;

      // Check PDF version
      const versionMatch = header.match(/%PDF-(\d+\.\d+)/);
      const pdfVersion = versionMatch ? versionMatch[1] : 'unknown';

      this.logger.debug(`Basic PDF extraction: ${pageCount} pages, PDF version ${pdfVersion}`);

      return {
        pageCount: Math.max(1, pageCount),
        wordCount: 0,
        diagramCount: 0,
        headings: [],
        extractedText: undefined,
      };
    } catch (err) {
      this.logger.warn(
        `Failed basic PDF metadata extraction: ${err instanceof Error ? err.message : String(err)}`,
      );
      return {
        pageCount: 1,
        wordCount: 0,
        diagramCount: 0,
        headings: [],
      };
    }
  }

  // ──────────────────────────────────────────────
  //  Plain text heading extraction (for PDF)
  // ──────────────────────────────────────────────

  private extractHeadingsFromPlainText(
    text: string,
  ): { level: number; title: string }[] {
    const headings: { level: number; title: string }[] = [];
    const lines = text.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Detect numbered headings like "1. Introduction", "1.1 Overview"
      const numberedMatch = line.match(
        /^(\d+(?:\.\d+)*)\s+([A-Z][A-Za-z\s:,&-]+)$/,
      );
      if (numberedMatch) {
        const dots = (numberedMatch[1].match(/\./g) || []).length;
        const level = dots + 1;
        headings.push({
          level: Math.min(level, 6),
          title: line,
        });
        continue;
      }

      // Detect all-caps headings (common in formal documents)
      if (
        line.length > 3 &&
        line.length < 100 &&
        line === line.toUpperCase() &&
        /^[A-Z\s\d:,&-]+$/.test(line)
      ) {
        headings.push({
          level: 1,
          title: line,
        });
      }
    }

    return headings;
  }

  // ──────────────────────────────────────────────
  //  Utilities
  // ──────────────────────────────────────────────

  private async readZipFile(zip: JSZip, filePath: string): Promise<string | null> {
    const file = zip.file(filePath);
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

  private countWords(text: string): number {
    if (!text) return 0;
    // Split on whitespace and filter out empty strings
    return text.split(/\s+/).filter((word) => word.length > 0).length;
  }

  private extractTextValue(value: unknown): string | null {
    if (value === undefined || value === null) return null;
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
      const obj = value as Record<string, any>;
      return obj['#text'] ?? obj['_'] ?? String(value);
    }
    return String(value);
  }
}
