"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  FileCode2,
  Hash,
} from "lucide-react";
import { cn } from "@ktblog/ui/lib/utils";
import { codeToHtml, type BundledLanguage } from "shiki";

// =============================================================================
// Types
// =============================================================================

interface CodeBlockProps {
  code: string;
  language?: string;
  fileName?: string;
  showLineNumbers?: boolean;
  highlightLines?: number[];
  maxHeight?: number;
  className?: string;
}

// =============================================================================
// Language display names
// =============================================================================

const LANGUAGE_LABELS: Record<string, string> = {
  js: "JavaScript",
  javascript: "JavaScript",
  ts: "TypeScript",
  typescript: "TypeScript",
  jsx: "JSX",
  tsx: "TSX",
  html: "HTML",
  css: "CSS",
  scss: "SCSS",
  json: "JSON",
  md: "Markdown",
  markdown: "Markdown",
  py: "Python",
  python: "Python",
  rb: "Ruby",
  ruby: "Ruby",
  go: "Go",
  rust: "Rust",
  rs: "Rust",
  java: "Java",
  kotlin: "Kotlin",
  kt: "Kotlin",
  swift: "Swift",
  c: "C",
  cpp: "C++",
  "c++": "C++",
  csharp: "C#",
  "c#": "C#",
  cs: "C#",
  php: "PHP",
  sql: "SQL",
  bash: "Bash",
  sh: "Shell",
  shell: "Shell",
  zsh: "Zsh",
  powershell: "PowerShell",
  yaml: "YAML",
  yml: "YAML",
  toml: "TOML",
  xml: "XML",
  graphql: "GraphQL",
  dockerfile: "Dockerfile",
  docker: "Dockerfile",
  nginx: "Nginx",
  lua: "Lua",
  r: "R",
  dart: "Dart",
  scala: "Scala",
  elixir: "Elixir",
  haskell: "Haskell",
  text: "Plain Text",
  txt: "Plain Text",
  plaintext: "Plain Text",
};

// Map common aliases to shiki-compatible language identifiers
const LANGUAGE_MAP: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  py: "python",
  rb: "ruby",
  rs: "rust",
  kt: "kotlin",
  cs: "csharp",
  "c#": "csharp",
  "c++": "cpp",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  yml: "yaml",
  docker: "dockerfile",
  txt: "text",
  plaintext: "text",
};

function resolveLanguage(lang: string): string {
  const normalized = lang.toLowerCase().trim();
  return LANGUAGE_MAP[normalized] || normalized;
}

function getLanguageLabel(lang: string): string {
  const normalized = lang.toLowerCase().trim();
  return LANGUAGE_LABELS[normalized] || lang.toUpperCase();
}

// =============================================================================
// CodeBlock Component
// =============================================================================

export function CodeBlock({
  code,
  language = "text",
  fileName,
  showLineNumbers = true,
  highlightLines = [],
  maxHeight = 600,
  className,
}: CodeBlockProps) {
  const [highlightedHtml, setHighlightedHtml] = useState<string>("");
  const [isCopied, setIsCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const codeContainerRef = useRef<HTMLDivElement>(null);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const resolvedLang = resolveLanguage(language);
  const langLabel = getLanguageLabel(language);
  const lines = code.split("\n");
  const lineCount = lines.length;

  // Highlight with shiki
  useEffect(() => {
    let cancelled = false;

    async function highlight() {
      try {
        const html = await codeToHtml(code, {
          lang: resolvedLang as BundledLanguage,
          themes: {
            light: "github-light",
            dark: "github-dark",
          },
        });
        if (!cancelled) {
          setHighlightedHtml(html);
        }
      } catch {
        // Fallback for unsupported languages: use plain text
        try {
          const html = await codeToHtml(code, {
            lang: "text",
            themes: {
              light: "github-light",
              dark: "github-dark",
            },
          });
          if (!cancelled) {
            setHighlightedHtml(html);
          }
        } catch {
          // Final fallback: render as plain text
          if (!cancelled) {
            setHighlightedHtml("");
          }
        }
      }
    }

    highlight();
    return () => {
      cancelled = true;
    };
  }, [code, resolvedLang]);

  // Check if code overflows maxHeight
  useEffect(() => {
    if (codeContainerRef.current) {
      setIsOverflowing(codeContainerRef.current.scrollHeight > maxHeight);
    }
  }, [highlightedHtml, maxHeight]);

  // Copy to clipboard
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);

      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch {
      // Fallback copy
      const textarea = document.createElement("textarea");
      textarea.value = code;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setIsCopied(true);

      copyTimeoutRef.current = setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    }
  }, [code]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className={cn(
        "relative group my-8 rounded-2xl overflow-hidden",
        "border border-neutral-200 dark:border-neutral-700",
        "shadow-lg dark:shadow-neutral-900/50",
        "print:shadow-none print:border-neutral-300",
        className
      )}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-100 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center gap-3 min-w-0">
          {/* Traffic light dots */}
          <div className="hidden sm:flex items-center gap-1.5" aria-hidden="true">
            <span className="w-3 h-3 rounded-full bg-red-400" />
            <span className="w-3 h-3 rounded-full bg-amber-400" />
            <span className="w-3 h-3 rounded-full bg-emerald-400" />
          </div>

          {/* File name or language */}
          {fileName ? (
            <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400 font-mono truncate">
              <FileCode2 className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{fileName}</span>
            </div>
          ) : (
            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
              {langLabel}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Line count */}
          <span className="hidden sm:flex items-center gap-1 text-xs text-neutral-400 dark:text-neutral-500 tabular-nums">
            <Hash className="h-3 w-3" />
            {lineCount} line{lineCount !== 1 ? "s" : ""}
          </span>

          {/* Copy button */}
          <button
            onClick={handleCopy}
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
              isCopied
                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                : "bg-white/60 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-600 hover:text-neutral-900 dark:hover:text-white"
            )}
            aria-label={isCopied ? "Copied to clipboard" : "Copy code to clipboard"}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isCopied ? (
                <motion.span
                  key="check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="flex items-center gap-1"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Copied!</span>
                </motion.span>
              ) : (
                <motion.span
                  key="copy"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="flex items-center gap-1"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Copy</span>
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Code content */}
      <div
        ref={codeContainerRef}
        className={cn(
          "overflow-x-auto transition-all duration-300",
          !isExpanded && isOverflowing && `overflow-y-hidden`
        )}
        style={{
          maxHeight: !isExpanded && isOverflowing ? `${maxHeight}px` : undefined,
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', ui-monospace, SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace",
        }}
      >
        {highlightedHtml ? (
          <div className="relative">
            {/* Line numbers overlay */}
            {showLineNumbers && (
              <div
                className="absolute left-0 top-0 bottom-0 w-12 bg-neutral-50/80 dark:bg-neutral-900/80 border-r border-neutral-200 dark:border-neutral-700/50 select-none pointer-events-none z-10"
                aria-hidden="true"
              >
                <div className="py-4 text-right pr-3">
                  {lines.map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "text-xs leading-[1.7rem] tabular-nums",
                        highlightLines.includes(i + 1)
                          ? "text-[#1E4DB7] dark:text-blue-400 font-bold"
                          : "text-neutral-400 dark:text-neutral-600"
                      )}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Highlighted line backgrounds */}
            {highlightLines.length > 0 && (
              <div
                className="absolute inset-0 pointer-events-none z-[1]"
                aria-hidden="true"
              >
                <div className="py-4">
                  {lines.map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-[1.7rem]",
                        highlightLines.includes(i + 1) &&
                          "bg-[#1E4DB7]/8 dark:bg-blue-400/10 border-l-2 border-[#1E4DB7] dark:border-blue-400"
                      )}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Shiki HTML output */}
            <div
              className={cn(
                "shiki-container text-sm leading-[1.7rem] relative z-[2]",
                "[&_pre]:!bg-white [&_pre]:dark:!bg-neutral-900",
                "[&_pre]:py-4 [&_pre]:overflow-x-auto",
                showLineNumbers ? "[&_pre]:pl-16 [&_pre]:pr-6" : "[&_pre]:px-6",
                "[&_code]:!bg-transparent [&_code]:!p-0",
                "[&_.line]:block"
              )}
              dangerouslySetInnerHTML={{ __html: highlightedHtml }}
            />
          </div>
        ) : (
          // Fallback (before shiki loads or on error)
          <pre
            className={cn(
              "bg-white dark:bg-neutral-900 py-4 overflow-x-auto text-sm leading-[1.7rem]",
              showLineNumbers ? "pl-16 pr-6" : "px-6"
            )}
          >
            {showLineNumbers && (
              <div
                className="absolute left-0 top-0 bottom-0 w-12 bg-neutral-50/80 dark:bg-neutral-900/80 border-r border-neutral-200 dark:border-neutral-700/50 select-none pointer-events-none"
                aria-hidden="true"
              >
                <div className="py-4 text-right pr-3">
                  {lines.map((_, i) => (
                    <div
                      key={i}
                      className="text-xs leading-[1.7rem] text-neutral-400 dark:text-neutral-600 tabular-nums"
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <code className="text-neutral-800 dark:text-neutral-200 font-mono">{code}</code>
          </pre>
        )}
      </div>

      {/* Expand/collapse button for long code blocks */}
      {isOverflowing && (
        <div className="relative">
          {/* Fade gradient when collapsed */}
          {!isExpanded && (
            <div className="absolute bottom-full left-0 right-0 h-16 bg-gradient-to-t from-white dark:from-neutral-900 to-transparent pointer-events-none z-10" />
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-200"
            aria-expanded={isExpanded}
            aria-label={isExpanded ? "Collapse code block" : "Expand code block"}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" />
                Show all {lineCount} lines
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
