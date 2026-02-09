"use client";

import { useState, useCallback } from "react";
import { Check, Copy, Terminal, Code2 } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type CodeLanguage =
    | "javascript"
    | "typescript"
    | "python"
    | "go"
    | "rust"
    | "curl"
    | "bash"
    | "json"
    | "yaml";

export interface CodeSample {
    id: string;
    language: CodeLanguage;
    label: string;
    code: string;
}

interface CodeSampleBlockProps {
    samples: CodeSample[];
    title?: string;
    description?: string;
    accentColor?: string;
    className?: string;
}

/* ------------------------------------------------------------------ */
/* Language configuration                                              */
/* ------------------------------------------------------------------ */

const languageConfig: Record<CodeLanguage, { icon: string; color: string; name: string }> = {
    javascript: { icon: "JS", color: "#F7DF1E", name: "JavaScript" },
    typescript: { icon: "TS", color: "#3178C6", name: "TypeScript" },
    python: { icon: "PY", color: "#3776AB", name: "Python" },
    go: { icon: "GO", color: "#00ADD8", name: "Go" },
    rust: { icon: "RS", color: "#DEA584", name: "Rust" },
    curl: { icon: "cURL", color: "#073551", name: "cURL" },
    bash: { icon: "$", color: "#4EAA25", name: "Bash" },
    json: { icon: "{}", color: "#000000", name: "JSON" },
    yaml: { icon: "YML", color: "#CB171E", name: "YAML" },
};

/* ------------------------------------------------------------------ */
/* Syntax Highlighting (Basic)                                         */
/* ------------------------------------------------------------------ */

function highlightSyntax(code: string, language: CodeLanguage): string {
    // Basic syntax highlighting patterns
    const patterns: Record<string, { regex: RegExp; className: string }[]> = {
        javascript: [
            { regex: /(\/\/.*$)/gm, className: "text-neutral-500" }, // comments
            { regex: /(['"`])((?:\\.|[^\\])*?)\1/g, className: "text-emerald-400" }, // strings
            { regex: /\b(const|let|var|function|return|if|else|for|while|async|await|import|export|from|class|new|this)\b/g, className: "text-purple-400" }, // keywords
            { regex: /\b(true|false|null|undefined)\b/g, className: "text-amber-400" }, // literals
            { regex: /\b(\d+\.?\d*)\b/g, className: "text-blue-400" }, // numbers
        ],
        typescript: [
            { regex: /(\/\/.*$)/gm, className: "text-neutral-500" },
            { regex: /(['"`])((?:\\.|[^\\])*?)\1/g, className: "text-emerald-400" },
            { regex: /\b(const|let|var|function|return|if|else|for|while|async|await|import|export|from|class|new|this|type|interface|extends|implements)\b/g, className: "text-purple-400" },
            { regex: /\b(true|false|null|undefined|string|number|boolean|void|any)\b/g, className: "text-amber-400" },
            { regex: /\b(\d+\.?\d*)\b/g, className: "text-blue-400" },
        ],
        python: [
            { regex: /(#.*$)/gm, className: "text-neutral-500" },
            { regex: /(['"`])((?:\\.|[^\\])*?)\1/g, className: "text-emerald-400" },
            { regex: /\b(def|class|return|if|elif|else|for|while|import|from|as|try|except|finally|with|async|await|lambda|yield)\b/g, className: "text-purple-400" },
            { regex: /\b(True|False|None)\b/g, className: "text-amber-400" },
            { regex: /\b(\d+\.?\d*)\b/g, className: "text-blue-400" },
        ],
        go: [
            { regex: /(\/\/.*$)/gm, className: "text-neutral-500" },
            { regex: /(['"`])((?:\\.|[^\\])*?)\1/g, className: "text-emerald-400" },
            { regex: /\b(func|return|if|else|for|range|switch|case|default|var|const|type|struct|interface|import|package|go|defer|chan|select)\b/g, className: "text-purple-400" },
            { regex: /\b(true|false|nil)\b/g, className: "text-amber-400" },
            { regex: /\b(\d+\.?\d*)\b/g, className: "text-blue-400" },
        ],
        rust: [
            { regex: /(\/\/.*$)/gm, className: "text-neutral-500" },
            { regex: /(['"`])((?:\\.|[^\\])*?)\1/g, className: "text-emerald-400" },
            { regex: /\b(fn|let|mut|const|if|else|for|while|loop|match|return|pub|mod|use|struct|enum|impl|trait|async|await|move)\b/g, className: "text-purple-400" },
            { regex: /\b(true|false|Some|None|Ok|Err)\b/g, className: "text-amber-400" },
            { regex: /\b(\d+\.?\d*)\b/g, className: "text-blue-400" },
        ],
        curl: [
            { regex: /(#.*$)/gm, className: "text-neutral-500" },
            { regex: /(['"])((?:\\.|[^\\])*?)\1/g, className: "text-emerald-400" },
            { regex: /(-X|--request|-H|--header|-d|--data|-o|--output|-s|--silent|curl)/g, className: "text-purple-400" },
            { regex: /(https?:\/\/[^\s'"]+)/g, className: "text-blue-400" },
        ],
        bash: [
            { regex: /(#.*$)/gm, className: "text-neutral-500" },
            { regex: /(['"])((?:\\.|[^\\])*?)\1/g, className: "text-emerald-400" },
            { regex: /\b(if|then|else|fi|for|do|done|while|case|esac|function|return|export|source)\b/g, className: "text-purple-400" },
            { regex: /(\$\w+|\$\{[^}]+\})/g, className: "text-amber-400" },
        ],
        json: [
            { regex: /("(?:[^"\\]|\\.)*")(?=\s*:)/g, className: "text-blue-400" }, // keys
            { regex: /:\s*("(?:[^"\\]|\\.)*")/g, className: "text-emerald-400" }, // string values
            { regex: /:\s*(true|false|null)\b/g, className: "text-amber-400" }, // literals
            { regex: /:\s*(-?\d+\.?\d*)/g, className: "text-purple-400" }, // numbers
        ],
        yaml: [
            { regex: /(#.*$)/gm, className: "text-neutral-500" },
            { regex: /^(\s*[\w-]+)(?=:)/gm, className: "text-blue-400" }, // keys
            { regex: /:\s*(['"])((?:\\.|[^\\])*?)\1/g, className: "text-emerald-400" }, // quoted strings
            { regex: /:\s*(true|false|null|~)\b/gi, className: "text-amber-400" }, // literals
            { regex: /:\s*(-?\d+\.?\d*)\s*$/gm, className: "text-purple-400" }, // numbers
        ],
    };

    let highlighted = code;
    const langPatterns = patterns[language] || patterns.javascript;

    // Escape HTML first
    highlighted = highlighted
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    // Apply patterns (simple approach - for production, consider using a library like Prism.js)
    langPatterns.forEach(({ regex, className }) => {
        highlighted = highlighted.replace(regex, (match) => {
            return `<span class="${className}">${match}</span>`;
        });
    });

    return highlighted;
}

/* ------------------------------------------------------------------ */
/* CodeSampleBlock Component                                           */
/* ------------------------------------------------------------------ */

export function CodeSampleBlock({
    samples,
    title,
    description,
    accentColor = "#2563EB",
    className = "",
}: CodeSampleBlockProps) {
    const [activeTab, setActiveTab] = useState(0);
    const [copied, setCopied] = useState(false);

    const activeSample = samples[activeTab];

    const handleCopy = useCallback(async () => {
        if (!activeSample) return;

        try {
            await navigator.clipboard.writeText(activeSample.code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    }, [activeSample]);

    if (!activeSample) return null;

    const langConfig = languageConfig[activeSample.language];

    return (
        <div className={`rounded-2xl overflow-hidden shadow-xl border border-neutral-200 ${className}`}>
            {/* Header */}
            {(title || description) && (
                <div className="px-5 py-4 bg-white border-b border-neutral-100">
                    {title && (
                        <div className="flex items-center gap-2 mb-1">
                            <Code2 className="h-4 w-4" style={{ color: accentColor }} />
                            <h3 className="font-semibold text-neutral-900">{title}</h3>
                        </div>
                    )}
                    {description && (
                        <p className="text-sm text-neutral-600">{description}</p>
                    )}
                </div>
            )}

            {/* Tabs */}
            <div className="flex items-center gap-1 px-4 py-2 bg-neutral-800 border-b border-neutral-700 overflow-x-auto">
                {samples.map((sample, index) => {
                    const config = languageConfig[sample.language];
                    const isActive = index === activeTab;

                    return (
                        <button
                            key={sample.id}
                            onClick={() => setActiveTab(index)}
                            className={`
                                flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium
                                transition-all duration-200 whitespace-nowrap
                                ${isActive
                                    ? "bg-neutral-700 text-white"
                                    : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700/50"
                                }
                            `}
                        >
                            <span
                                className="text-xs font-bold"
                                style={{ color: isActive ? config.color : undefined }}
                            >
                                {config.icon}
                            </span>
                            {sample.label}
                        </button>
                    );
                })}

                {/* Copy button */}
                <button
                    onClick={handleCopy}
                    className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-700 transition-all duration-200"
                    title="Copy to clipboard"
                >
                    {copied ? (
                        <>
                            <Check className="h-4 w-4 text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                        </>
                    ) : (
                        <>
                            <Copy className="h-4 w-4" />
                            <span className="hidden sm:inline">Copy</span>
                        </>
                    )}
                </button>
            </div>

            {/* Code content */}
            <div className="relative bg-neutral-900">
                {/* Language indicator */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded bg-neutral-800 text-xs text-neutral-400">
                    <Terminal className="h-3 w-3" />
                    {langConfig.name}
                </div>

                {/* Code block */}
                <pre className="p-5 pt-10 overflow-x-auto text-sm leading-relaxed">
                    <code
                        className="font-mono text-neutral-300"
                        dangerouslySetInnerHTML={{
                            __html: highlightSyntax(activeSample.code, activeSample.language),
                        }}
                    />
                </pre>

                {/* Line numbers overlay */}
                <div className="absolute top-10 left-0 px-3 py-5 text-right select-none pointer-events-none">
                    {activeSample.code.split("\n").map((_, i) => (
                        <div key={i} className="text-neutral-600 text-xs font-mono leading-relaxed">
                            {i + 1}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* SimpleCodeBlock - Inline code block without tabs                    */
/* ------------------------------------------------------------------ */

interface SimpleCodeBlockProps {
    code: string;
    language?: CodeLanguage;
    title?: string;
    accentColor?: string;
    showLineNumbers?: boolean;
    className?: string;
}

export function SimpleCodeBlock({
    code,
    language = "javascript",
    title,
    accentColor = "#2563EB",
    showLineNumbers = true,
    className = "",
}: SimpleCodeBlockProps) {
    const [copied, setCopied] = useState(false);
    const langConfig = languageConfig[language];

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    }, [code]);

    return (
        <div className={`rounded-xl overflow-hidden shadow-lg border border-neutral-200 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-neutral-800 border-b border-neutral-700">
                <div className="flex items-center gap-2">
                    {/* Window dots */}
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>

                    {title && (
                        <span className="text-sm text-neutral-400 ml-3">{title}</span>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <span
                        className="text-xs font-bold"
                        style={{ color: langConfig.color }}
                    >
                        {langConfig.icon}
                    </span>

                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-1 text-neutral-400 hover:text-white transition-colors"
                        title="Copy to clipboard"
                    >
                        {copied ? (
                            <Check className="h-4 w-4 text-emerald-400" />
                        ) : (
                            <Copy className="h-4 w-4" />
                        )}
                    </button>
                </div>
            </div>

            {/* Code content */}
            <div className="relative bg-neutral-900">
                <pre className={`p-4 overflow-x-auto text-sm leading-relaxed ${showLineNumbers ? "pl-12" : ""}`}>
                    <code
                        className="font-mono text-neutral-300"
                        dangerouslySetInnerHTML={{
                            __html: highlightSyntax(code, language),
                        }}
                    />
                </pre>

                {/* Line numbers */}
                {showLineNumbers && (
                    <div className="absolute top-0 left-0 px-3 py-4 text-right select-none pointer-events-none border-r border-neutral-800">
                        {code.split("\n").map((_, i) => (
                            <div key={i} className="text-neutral-600 text-xs font-mono leading-relaxed">
                                {i + 1}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
