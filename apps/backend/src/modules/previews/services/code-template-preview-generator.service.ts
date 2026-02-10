import { Injectable, Logger } from '@nestjs/common';
import JSZip from 'jszip';

export interface CodeFilePreview {
  path: string;
  fileName: string;
  language: string;
  content: string;
  size: number;
}

export interface CodeProjectInfo {
  fileTree: CodeFileNode[];
  totalFiles: number;
  totalLines: number;
  languages: { name: string; percentage: number; color: string }[];
  dependencies?: { name: string; version: string; type: 'production' | 'development' }[];
  license?: string;
}

export interface CodeFileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  language?: string;
  content?: string;
  children?: CodeFileNode[];
  size?: number;
}

const LANGUAGE_COLORS: Record<string, string> = {
  typescript: '#3178C6',
  javascript: '#F7DF1E',
  python: '#3776AB',
  rust: '#DEA584',
  go: '#00ADD8',
  java: '#ED8B00',
  css: '#563D7C',
  html: '#E34F26',
  json: '#292929',
  markdown: '#083FA1',
  yaml: '#CB171E',
  shell: '#89E051',
};

const EXTENSION_TO_LANGUAGE: Record<string, string> = {
  ts: 'typescript', tsx: 'typescript',
  js: 'javascript', jsx: 'javascript', mjs: 'javascript',
  py: 'python',
  rs: 'rust',
  go: 'go',
  java: 'java',
  css: 'css', scss: 'css',
  html: 'html', htm: 'html',
  json: 'json',
  md: 'markdown',
  yml: 'yaml', yaml: 'yaml',
  sh: 'shell', bash: 'shell',
};

@Injectable()
export class CodeTemplatePreviewGeneratorService {
  private readonly logger = new Logger(CodeTemplatePreviewGeneratorService.name);

  /**
   * Extract and analyze files from a ZIP archive containing code templates.
   */
  async analyzeCodeArchive(
    zipBuffer: Buffer,
    options: { maxFiles?: number; maxFileSize?: number } = {},
  ): Promise<CodeProjectInfo> {
    const { maxFiles = 10, maxFileSize = 50000 } = options;

    try {
      const zip = await JSZip.loadAsync(zipBuffer);
      const allFiles = Object.keys(zip.files).filter((f) => !zip.files[f].dir);

      // Build file tree
      const fileTree = this.buildFileTree(allFiles);

      // Extract key files for preview
      const keyFiles = this.selectKeyFiles(allFiles, maxFiles);
      const fileContents: CodeFilePreview[] = [];

      for (const filePath of keyFiles) {
        const file = zip.file(filePath);
        if (!file) continue;

        try {
          const content = await file.async('string');
          if (content.length > maxFileSize) continue;

          const ext = filePath.split('.').pop()?.toLowerCase() ?? '';
          const language = EXTENSION_TO_LANGUAGE[ext] ?? 'text';

          fileContents.push({
            path: filePath,
            fileName: filePath.split('/').pop() ?? filePath,
            language,
            content,
            size: content.length,
          });
        } catch {
          continue;
        }
      }

      // Populate content in file tree for selected files
      this.populateFileTreeContent(fileTree, fileContents);

      // Language statistics
      const languageCounts = this.calculateLanguageStats(allFiles);

      // Parse package.json for dependencies
      let dependencies: CodeProjectInfo['dependencies'];
      let license: string | undefined;

      const packageJsonPath = allFiles.find(
        (f) => f.endsWith('package.json') && f.split('/').length <= 2,
      );
      if (packageJsonPath) {
        const pkgFile = zip.file(packageJsonPath);
        if (pkgFile) {
          try {
            const pkgContent = await pkgFile.async('string');
            const pkg = JSON.parse(pkgContent);
            license = pkg.license;
            dependencies = [];

            if (pkg.dependencies) {
              for (const [name, version] of Object.entries(pkg.dependencies)) {
                dependencies.push({ name, version: String(version), type: 'production' });
              }
            }
            if (pkg.devDependencies) {
              for (const [name, version] of Object.entries(pkg.devDependencies)) {
                dependencies.push({ name, version: String(version), type: 'development' });
              }
            }
          } catch {
            // Ignore parse errors
          }
        }
      }

      const totalLines = fileContents.reduce(
        (sum, f) => sum + f.content.split('\n').length,
        0,
      );

      return {
        fileTree,
        totalFiles: allFiles.length,
        totalLines,
        languages: languageCounts,
        dependencies,
        license,
      };
    } catch (err) {
      this.logger.error(
        `Code archive analysis failed: ${err instanceof Error ? err.message : String(err)}`,
      );
      return {
        fileTree: [],
        totalFiles: 0,
        totalLines: 0,
        languages: [],
      };
    }
  }

  private buildFileTree(filePaths: string[]): CodeFileNode[] {
    const root: CodeFileNode[] = [];

    for (const filePath of filePaths) {
      const parts = filePath.split('/').filter(Boolean);
      let current = root;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isFile = i === parts.length - 1;
        const currentPath = parts.slice(0, i + 1).join('/');

        const existing = current.find((n) => n.name === part);
        if (existing) {
          if (!isFile && existing.children) {
            current = existing.children;
          }
        } else {
          const ext = isFile ? part.split('.').pop()?.toLowerCase() ?? '' : '';
          const node: CodeFileNode = {
            name: part,
            path: currentPath,
            type: isFile ? 'file' : 'directory',
            ...(isFile ? { language: EXTENSION_TO_LANGUAGE[ext] ?? 'text', size: 0 } : { children: [] }),
          };
          current.push(node);

          if (!isFile && node.children) {
            current = node.children;
          }
        }
      }
    }

    // Sort: directories first, then files, alphabetically within each group
    this.sortFileTree(root);
    return root;
  }

  private sortFileTree(nodes: CodeFileNode[]): void {
    nodes.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    for (const node of nodes) {
      if (node.children) {
        this.sortFileTree(node.children);
      }
    }
  }

  private selectKeyFiles(files: string[], max: number): string[] {
    // Prioritize important files
    const priorities = [
      'README.md', 'readme.md',
      'package.json',
      'tsconfig.json',
    ];

    const selected: string[] = [];

    // Add priority files first
    for (const priority of priorities) {
      const match = files.find(
        (f) => f.endsWith(priority) && f.split('/').length <= 2,
      );
      if (match && selected.length < max) {
        selected.push(match);
      }
    }

    // Add source files by importance
    const sourceExtensions = ['ts', 'tsx', 'js', 'jsx', 'py', 'rs', 'go'];
    const sourceFiles = files
      .filter((f) => {
        const ext = f.split('.').pop()?.toLowerCase() ?? '';
        return sourceExtensions.includes(ext) && !selected.includes(f);
      })
      .sort((a, b) => a.split('/').length - b.split('/').length); // Prefer shallow files

    for (const file of sourceFiles) {
      if (selected.length >= max) break;
      selected.push(file);
    }

    return selected;
  }

  private populateFileTreeContent(
    tree: CodeFileNode[],
    files: CodeFilePreview[],
  ): void {
    const contentMap = new Map(files.map((f) => [f.path, f]));

    const traverse = (nodes: CodeFileNode[]) => {
      for (const node of nodes) {
        if (node.type === 'file') {
          const content = contentMap.get(node.path);
          if (content) {
            node.content = content.content;
            node.size = content.size;
          }
        }
        if (node.children) {
          traverse(node.children);
        }
      }
    };

    traverse(tree);
  }

  private calculateLanguageStats(
    files: string[],
  ): { name: string; percentage: number; color: string }[] {
    const counts: Record<string, number> = {};

    for (const file of files) {
      const ext = file.split('.').pop()?.toLowerCase() ?? '';
      const lang = EXTENSION_TO_LANGUAGE[ext];
      if (lang) {
        counts[lang] = (counts[lang] ?? 0) + 1;
      }
    }

    const total = Object.values(counts).reduce((s, c) => s + c, 0);
    if (total === 0) return [];

    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        percentage: Math.round((count / total) * 100),
        color: LANGUAGE_COLORS[name] ?? '#6B7280',
      }))
      .sort((a, b) => b.percentage - a.percentage);
  }
}
