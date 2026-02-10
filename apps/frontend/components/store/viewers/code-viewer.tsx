"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronDown,
  X,
  Copy,
  Check,
  Folder,
  FolderOpen,
  FileText,
  FileCode2,
  Braces,
  Globe,
  Palette,
  Hash,
  Lock,
  ShoppingCart,
  Package,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
  BarChart3,
} from "lucide-react";
import { cn } from "@ktblog/ui/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";

// =============================================================================
// Types
// =============================================================================

export interface CodeFileNode {
  name: string;
  path: string;
  type: "file" | "directory";
  language?: string;
  content?: string;
  children?: CodeFileNode[];
  size?: number;
  isGated?: boolean;
}

export interface ProjectStats {
  totalFiles: number;
  totalLines: number;
  languages: { name: string; percentage: number; color: string }[];
  dependencies?: { name: string; version: string; type: "production" | "development" }[];
  license?: string;
}

interface CodeViewerProps {
  fileTree: CodeFileNode[];
  defaultOpenFiles?: string[];
  projectStats?: ProjectStats;
  onPurchaseClick?: () => void;
  className?: string;
}

interface OpenTab {
  path: string;
  name: string;
  language?: string;
}

// =============================================================================
// File icon mapping
// =============================================================================

function getFileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  switch (ext) {
    case "ts":
    case "tsx":
      return <span className="text-[10px] font-bold text-blue-500">TS</span>;
    case "js":
    case "jsx":
    case "mjs":
      return <span className="text-[10px] font-bold text-yellow-500">JS</span>;
    case "json":
      return <Braces className="h-3.5 w-3.5 text-neutral-500" />;
    case "md":
    case "mdx":
      return <FileText className="h-3.5 w-3.5 text-blue-400" />;
    case "css":
    case "scss":
    case "sass":
      return <Palette className="h-3.5 w-3.5 text-purple-500" />;
    case "html":
    case "htm":
      return <Globe className="h-3.5 w-3.5 text-orange-500" />;
    case "py":
      return <span className="text-[10px] font-bold text-green-500">PY</span>;
    default:
      return <FileCode2 className="h-3.5 w-3.5 text-neutral-400" />;
  }
}

// =============================================================================
// FileTreeNode
// =============================================================================

function FileTreeNode({
  node,
  depth,
  expandedDirs,
  toggleDir,
  activeFilePath,
  onFileSelect,
}: {
  node: CodeFileNode;
  depth: number;
  expandedDirs: Set<string>;
  toggleDir: (path: string) => void;
  activeFilePath: string | null;
  onFileSelect: (node: CodeFileNode) => void;
}) {
  const isExpanded = expandedDirs.has(node.path);
  const isActive = node.path === activeFilePath;

  if (node.type === "directory") {
    return (
      <div>
        <button
          onClick={() => toggleDir(node.path)}
          className={cn(
            "w-full flex items-center gap-1.5 py-1 px-2 text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50 transition-colors",
          )}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          {isExpanded ? (
            <ChevronDown className="h-3 w-3 flex-shrink-0" />
          ) : (
            <ChevronRight className="h-3 w-3 flex-shrink-0" />
          )}
          {isExpanded ? (
            <FolderOpen className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
          ) : (
            <Folder className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
          )}
          <span className="truncate">{node.name}</span>
        </button>
        {isExpanded && node.children && (
          <div>
            {node.children.map((child) => (
              <FileTreeNode
                key={child.path}
                node={child}
                depth={depth + 1}
                expandedDirs={expandedDirs}
                toggleDir={toggleDir}
                activeFilePath={activeFilePath}
                onFileSelect={onFileSelect}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => onFileSelect(node)}
      className={cn(
        "w-full flex items-center gap-1.5 py-1 px-2 text-xs transition-colors",
        isActive
          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
          : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50",
      )}
      style={{ paddingLeft: `${depth * 12 + 20}px` }}
    >
      <span className="flex-shrink-0 w-4 flex items-center justify-center">
        {getFileIcon(node.name)}
      </span>
      <span className="truncate">{node.name}</span>
      {node.isGated && <Lock className="h-3 w-3 text-neutral-400 flex-shrink-0 ml-auto" />}
    </button>
  );
}

// =============================================================================
// CodeViewer Component
// =============================================================================

export function CodeViewer({
  fileTree,
  defaultOpenFiles,
  projectStats,
  onPurchaseClick,
  className,
}: CodeViewerProps) {
  const [openTabs, setOpenTabs] = useState<OpenTab[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());
  const [showSidebar, setShowSidebar] = useState(true);
  const [showDeps, setShowDeps] = useState(false);
  const [depSearch, setDepSearch] = useState("");
  const [highlightedCode, setHighlightedCode] = useState<Record<string, string>>({});
  const [isCopied, setIsCopied] = useState(false);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const isMobile = useMediaQuery("(max-width: 767px)");

  // Find a file node by path
  const findNode = useCallback(
    (path: string, nodes: CodeFileNode[] = fileTree): CodeFileNode | null => {
      for (const node of nodes) {
        if (node.path === path) return node;
        if (node.children) {
          const found = findNode(path, node.children);
          if (found) return found;
        }
      }
      return null;
    },
    [fileTree],
  );

  // Auto-expand directories for default open files
  useEffect(() => {
    if (!defaultOpenFiles?.length) {
      // Auto-open first file
      const firstFile = findFirstFile(fileTree);
      if (firstFile) {
        expandPathTo(firstFile.path);
        openFile(firstFile);
      }
      return;
    }

    const dirs = new Set<string>();
    for (const filePath of defaultOpenFiles) {
      const parts = filePath.split("/");
      for (let i = 1; i < parts.length; i++) {
        dirs.add(parts.slice(0, i).join("/"));
      }
    }
    setExpandedDirs(dirs);

    // Open default files in tabs
    const tabs: OpenTab[] = [];
    for (const filePath of defaultOpenFiles) {
      const node = findNode(filePath);
      if (node && node.type === "file") {
        tabs.push({ path: node.path, name: node.name, language: node.language });
      }
    }
    if (tabs.length > 0) {
      setOpenTabs(tabs);
      setActiveTab(tabs[0].path);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function findFirstFile(nodes: CodeFileNode[]): CodeFileNode | null {
    for (const node of nodes) {
      if (node.type === "file") return node;
      if (node.children) {
        const found = findFirstFile(node.children);
        if (found) return found;
      }
    }
    return null;
  }

  function expandPathTo(filePath: string) {
    const parts = filePath.split("/");
    const dirs = new Set(expandedDirs);
    for (let i = 1; i < parts.length; i++) {
      dirs.add(parts.slice(0, i).join("/"));
    }
    setExpandedDirs(dirs);
  }

  const toggleDir = useCallback((path: string) => {
    setExpandedDirs((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const openFile = useCallback((node: CodeFileNode) => {
    if (node.type !== "file") return;

    setOpenTabs((prev) => {
      if (prev.some((t) => t.path === node.path)) return prev;
      return [...prev, { path: node.path, name: node.name, language: node.language }];
    });
    setActiveTab(node.path);
  }, []);

  const closeTab = useCallback(
    (path: string, e?: React.MouseEvent) => {
      e?.stopPropagation();
      setOpenTabs((prev) => {
        const next = prev.filter((t) => t.path !== path);
        if (activeTab === path) {
          setActiveTab(next.length > 0 ? next[next.length - 1].path : null);
        }
        return next;
      });
    },
    [activeTab],
  );

  // Get active file content
  const activeNode = activeTab ? findNode(activeTab) : null;
  const activeContent = activeNode?.content ?? "";
  const activeLanguage = activeNode?.language ?? "text";
  const isGated = activeNode?.isGated ?? false;
  const gatedPreviewLines = 20;

  // Highlight code with Shiki
  useEffect(() => {
    if (!activeTab || !activeContent) return;
    if (highlightedCode[activeTab]) return;

    let cancelled = false;

    async function highlight() {
      try {
        const { codeToHtml } = await import("shiki");
        const displayContent = isGated
          ? activeContent.split("\n").slice(0, gatedPreviewLines).join("\n")
          : activeContent;

        const html = await codeToHtml(displayContent, {
          lang: activeLanguage as any,
          theme: "github-dark",
        });

        if (!cancelled) {
          setHighlightedCode((prev) => ({ ...prev, [activeTab!]: html }));
        }
      } catch {
        // Fallback for unsupported languages
        try {
          const { codeToHtml } = await import("shiki");
          const displayContent = isGated
            ? activeContent.split("\n").slice(0, gatedPreviewLines).join("\n")
            : activeContent;

          const html = await codeToHtml(displayContent, {
            lang: "text",
            theme: "github-dark",
          });
          if (!cancelled) {
            setHighlightedCode((prev) => ({ ...prev, [activeTab!]: html }));
          }
        } catch {
          // Give up
        }
      }
    }

    highlight();
    return () => { cancelled = true; };
  }, [activeTab, activeContent, activeLanguage, isGated, highlightedCode]);

  // Copy code
  const handleCopy = useCallback(async () => {
    if (!activeContent) return;
    try {
      await navigator.clipboard.writeText(activeContent);
      setIsCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Ignore
    }
  }, [activeContent]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  // Line count for active file
  const lineCount = activeContent ? activeContent.split("\n").length : 0;
  const displayLineCount = isGated ? Math.min(lineCount, gatedPreviewLines) : lineCount;

  // Breadcrumb from active path
  const breadcrumb = activeTab?.split("/") ?? [];

  // Filter dependencies
  const filteredDeps = useMemo(() => {
    if (!projectStats?.dependencies) return [];
    if (!depSearch) return projectStats.dependencies;
    return projectStats.dependencies.filter((d) =>
      d.name.toLowerCase().includes(depSearch.toLowerCase()),
    );
  }, [projectStats?.dependencies, depSearch]);

  return (
    <div
      className={cn(
        "flex bg-[#0d1117] rounded-xl overflow-hidden border border-neutral-700",
        className,
      )}
      style={{ height: isDesktop ? "70vh" : "60vh", minHeight: "400px" }}
    >
      {/* File tree sidebar */}
      <AnimatePresence>
        {showSidebar && (isDesktop || !isMobile) && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: isMobile ? "100%" : 250, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "flex-shrink-0 bg-[#161b22] border-r border-neutral-700 overflow-y-auto",
              isMobile && "absolute inset-0 z-20",
            )}
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-700">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Explorer
              </span>
              {isMobile && (
                <button
                  onClick={() => setShowSidebar(false)}
                  className="p-1 text-neutral-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="py-1">
              {fileTree.map((node) => (
                <FileTreeNode
                  key={node.path}
                  node={node}
                  depth={0}
                  expandedDirs={expandedDirs}
                  toggleDir={toggleDir}
                  activeFilePath={activeTab}
                  onFileSelect={openFile}
                />
              ))}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Tab bar */}
        <div className="flex items-center bg-[#161b22] border-b border-neutral-700 overflow-x-auto flex-shrink-0">
          {/* Sidebar toggle */}
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 text-neutral-500 hover:text-white flex-shrink-0 border-r border-neutral-700"
            aria-label={showSidebar ? "Hide sidebar" : "Show sidebar"}
          >
            {showSidebar ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
          </button>

          {/* Tabs */}
          <div className="flex overflow-x-auto">
            {openTabs.map((tab) => (
              <button
                key={tab.path}
                onClick={() => setActiveTab(tab.path)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 text-xs border-r border-neutral-700 whitespace-nowrap transition-colors group",
                  activeTab === tab.path
                    ? "bg-[#0d1117] text-white border-b-2 border-b-blue-500"
                    : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/50",
                )}
              >
                <span className="flex-shrink-0 w-4 flex items-center justify-center">
                  {getFileIcon(tab.name)}
                </span>
                <span>{tab.name}</span>
                <button
                  onClick={(e) => closeTab(tab.path, e)}
                  className="ml-1 p-0.5 rounded hover:bg-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={`Close ${tab.name}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </button>
            ))}
          </div>

          {/* Right controls */}
          <div className="ml-auto flex items-center gap-1 px-2 flex-shrink-0">
            {/* Dependencies toggle */}
            {projectStats?.dependencies && (
              <button
                onClick={() => setShowDeps(!showDeps)}
                className={cn(
                  "p-1.5 rounded transition-colors",
                  showDeps ? "text-blue-400 bg-blue-900/20" : "text-neutral-500 hover:text-white",
                )}
                aria-label="Toggle dependencies"
              >
                <Package className="h-3.5 w-3.5" />
              </button>
            )}

            {/* Copy */}
            {activeContent && !isGated && (
              <button
                onClick={handleCopy}
                className="p-1.5 text-neutral-500 hover:text-white rounded transition-colors"
                aria-label={isCopied ? "Copied" : "Copy code"}
              >
                {isCopied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            )}
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-auto">
          {showDeps && projectStats?.dependencies ? (
            /* Dependencies panel */
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm font-semibold text-neutral-300">Dependencies</h3>
                {projectStats.dependencies.length > 10 && (
                  <div className="flex-1 max-w-xs">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500" />
                      <input
                        type="text"
                        value={depSearch}
                        onChange={(e) => setDepSearch(e.target.value)}
                        placeholder="Search..."
                        className="w-full pl-7 pr-3 py-1 bg-neutral-800 border border-neutral-700 rounded text-xs text-neutral-300 placeholder:text-neutral-600 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {filteredDeps.map((dep) => (
                  <div
                    key={dep.name}
                    className="flex items-center justify-between px-3 py-2 bg-neutral-800/50 border border-neutral-700/50 rounded-lg"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-neutral-300 truncate">{dep.name}</p>
                      <p className="text-[10px] text-neutral-500 truncate">{dep.version}</p>
                    </div>
                    <span
                      className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 ml-2",
                        dep.type === "production"
                          ? "bg-green-900/30 text-green-400"
                          : "bg-neutral-700 text-neutral-400",
                      )}
                    >
                      {dep.type === "production" ? "prod" : "dev"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : activeNode ? (
            /* Code display */
            <div>
              {/* File path breadcrumb */}
              <div className="flex items-center justify-between px-4 py-1.5 border-b border-neutral-700/50 bg-[#161b22]/50">
                <div className="flex items-center gap-1 text-xs text-neutral-500 overflow-x-auto">
                  {breadcrumb.map((part, idx) => (
                    <span key={idx} className="flex items-center gap-1 flex-shrink-0">
                      {idx > 0 && <span className="text-neutral-600">/</span>}
                      <span className={idx === breadcrumb.length - 1 ? "text-neutral-300" : ""}>
                        {part}
                      </span>
                    </span>
                  ))}
                </div>
                <span className="text-[10px] text-neutral-600 ml-2 flex-shrink-0 uppercase">
                  {activeLanguage}
                </span>
              </div>

              {/* Code */}
              <div className="relative">
                {/* Line numbers */}
                <div className="absolute left-0 top-0 bottom-0 w-12 bg-[#0d1117] border-r border-neutral-800 select-none pointer-events-none z-10">
                  <div className="py-4 text-right pr-3">
                    {Array.from({ length: displayLineCount }, (_, i) => (
                      <div key={i} className="text-[11px] leading-[1.5rem] text-neutral-600 tabular-nums">
                        {i + 1}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Highlighted code */}
                <div
                  className={cn(
                    "text-sm leading-[1.5rem] overflow-x-auto",
                    "[&_pre]:!bg-[#0d1117] [&_pre]:py-4 [&_pre]:pl-16 [&_pre]:pr-6",
                    "[&_code]:!bg-transparent [&_code]:!p-0",
                    "[&_.line]:block",
                  )}
                  dangerouslySetInnerHTML={{
                    __html: highlightedCode[activeTab ?? ""] ?? `<pre class="!bg-[#0d1117] py-4 pl-16 pr-6"><code class="text-neutral-300 font-mono text-sm">${escapeHtml(
                      isGated ? activeContent.split("\n").slice(0, gatedPreviewLines).join("\n") : activeContent
                    )}</code></pre>`,
                  }}
                />

                {/* Gated overlay */}
                {isGated && (
                  <div className="relative">
                    <div className="absolute -top-20 inset-x-0 h-20 bg-gradient-to-t from-[#0d1117] to-transparent pointer-events-none" />
                    <div className="bg-[#0d1117] flex flex-col items-center justify-center py-12 border-t border-neutral-700/30">
                      <Lock className="h-8 w-8 text-neutral-500 mb-3" />
                      <p className="text-sm font-medium text-neutral-300 mb-1">
                        Full source code requires purchase
                      </p>
                      <p className="text-xs text-neutral-500 mb-4">
                        Showing {gatedPreviewLines} of {lineCount} lines
                      </p>
                      {onPurchaseClick && (
                        <button
                          onClick={onPurchaseClick}
                          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          Purchase to View
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Empty state */
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FileCode2 className="h-12 w-12 text-neutral-700 mx-auto mb-3" />
                <p className="text-sm text-neutral-500">Select a file to view its contents</p>
              </div>
            </div>
          )}
        </div>

        {/* Stats bar */}
        {projectStats && (
          <div className="flex items-center gap-4 px-4 py-1.5 bg-[#161b22] border-t border-neutral-700 text-[11px] text-neutral-500 flex-shrink-0 overflow-x-auto">
            <span>{projectStats.totalFiles} files</span>
            <span>{projectStats.totalLines.toLocaleString()} lines</span>
            {projectStats.license && <span>{projectStats.license}</span>}
            {/* Language bar */}
            {projectStats.languages.length > 0 && (
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <div className="flex h-1.5 flex-1 rounded-full overflow-hidden bg-neutral-800 min-w-[100px]">
                  {projectStats.languages.map((lang) => (
                    <div
                      key={lang.name}
                      className="h-full"
                      style={{ width: `${lang.percentage}%`, backgroundColor: lang.color }}
                      title={`${lang.name}: ${lang.percentage}%`}
                    />
                  ))}
                </div>
                <div className="hidden md:flex items-center gap-2 flex-shrink-0">
                  {projectStats.languages.slice(0, 3).map((lang) => (
                    <span key={lang.name} className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: lang.color }} />
                      {lang.name} {lang.percentage}%
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export default CodeViewer;
