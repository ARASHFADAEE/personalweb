"use client";

import * as React from "react";
import { Check, Copy, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import { toPersianDigits } from "@/lib/slug";

type CodeBlockProps = {
  language: string;
  code: string;
  showLineNumbers?: boolean;
};

const TOKEN_REGEX: Array<{ lang: string | "any"; re: RegExp; cls: string }> = [
  { lang: "any", re: /(\/\/[^\n]*|#[^\n]*|\/\*[\s\S]*?\*\/)/g, cls: "tok-com" },
  { lang: "any", re: /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)/g, cls: "tok-str" },
  { lang: "any", re: /\b(\d+\.?\d*)\b/g, cls: "tok-num" },
  {
    lang: "any",
    re: /\b(const|let|var|function|return|if|else|for|while|switch|case|break|continue|new|class|extends|import|from|export|default|async|await|try|catch|finally|throw|typeof|instanceof|in|of|this|super|void|delete|yield|static|public|private|protected|readonly|interface|type|enum|namespace|implements|declare|as|is|keyof|infer|satisfies|fn|use|echo|print|require|include)\b/g,
    cls: "tok-kw",
  },
  {
    lang: "any",
    re: /\b(true|false|null|undefined|NaN|Infinity|window|document|console|Math|JSON|Promise|Array|Object|String|Number|Boolean|Map|Set|Date|RegExp|Error)\b/g,
    cls: "tok-glb",
  },
  { lang: "ts", re: /\b(string|number|boolean|any|unknown|never|void|object|symbol|bigint)\b/g, cls: "tok-type" },
  {
    lang: "py",
    re: /\b(def|elif|lambda|pass|with|as|not|and|or|is|None|True|False|self|print|range|len|str|int|float|list|dict|tuple|set)\b/g,
    cls: "tok-kw",
  },
  {
    lang: "sql",
    re: /\b(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|JOIN|INNER|LEFT|RIGHT|ON|GROUP|ORDER|BY|HAVING|LIMIT|OFFSET|VALUES|INTO|AND|OR|NOT|CREATE|TABLE|INDEX|PRIMARY|KEY|FOREIGN|REFERENCES|ALTER|ADD|DROP|UNIQUE|DEFAULT)\b/g,
    cls: "tok-kw",
  },
  {
    lang: "php",
    re: /\b(function|class|public|private|protected|static|return|if|else|elseif|foreach|for|while|switch|case|break|continue|new|extends|implements|namespace|use|as|echo|print|require|include|true|false|null)\b/g,
    cls: "tok-kw",
  },
];

const LANG_MAP: Record<string, string> = {
  ts: "ts",
  tsx: "ts",
  typescript: "ts",
  js: "ts",
  jsx: "ts",
  javascript: "ts",
  py: "py",
  python: "py",
  sql: "sql",
  postgres: "sql",
  bash: "bash",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  css: "css",
  scss: "css",
  html: "html",
  xml: "html",
  json: "json",
  dockerfile: "bash",
  yml: "yaml",
  yaml: "yaml",
  php: "php",
  prisma: "sql",
  md: "text",
  markdown: "text",
  text: "text",
  txt: "text",
};

const LANG_LABELS: Record<string, string> = {
  ts: "TypeScript",
  js: "JavaScript",
  javascript: "JavaScript",
  typescript: "TypeScript",
  tsx: "TSX",
  jsx: "JSX",
  py: "Python",
  python: "Python",
  sql: "SQL",
  bash: "Bash",
  sh: "Shell",
  shell: "Shell",
  css: "CSS",
  html: "HTML",
  json: "JSON",
  yaml: "YAML",
  yml: "YAML",
  php: "PHP",
  prisma: "Prisma",
  dockerfile: "Dockerfile",
  text: "Plain text",
  txt: "Text",
  md: "Markdown",
  markdown: "Markdown",
};

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function highlight(code: string, language: string): string {
  const lang = LANG_MAP[language.toLowerCase()] ?? "any";
  const tokens = TOKEN_REGEX.filter((t) => t.lang === "any" || t.lang === lang);

  type Match = { start: number; end: number; cls: string };
  const matches: Match[] = [];
  for (const t of tokens) {
    t.re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = t.re.exec(code)) !== null) {
      matches.push({ start: m.index, end: m.index + m[0].length, cls: t.cls });
    }
  }
  matches.sort((a, b) => a.start - b.start || a.end - b.end);

  const filtered: Match[] = [];
  let lastEnd = -1;
  for (const m of matches) {
    if (m.start >= lastEnd) {
      filtered.push(m);
      lastEnd = m.end;
    }
  }

  let html = "";
  let pos = 0;
  for (const m of filtered) {
    html += escapeHtml(code.slice(pos, m.start));
    html += `<span class="${m.cls}">${escapeHtml(code.slice(m.start, m.end))}</span>`;
    pos = m.end;
  }
  html += escapeHtml(code.slice(pos));
  return html;
}

function formatLanguageLabel(language: string) {
  const key = language.toLowerCase();
  return LANG_LABELS[key] ?? language.toUpperCase();
}

export function CodeBlock({ language, code, showLineNumbers = false }: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const lang = language?.trim() || "text";
  const lines = React.useMemo(() => code.split("\n"), [code]);
  const lineCount = lines.length;
  const useLineNumbers = showLineNumbers || lineCount > 8;

  const highlighted = React.useMemo(() => highlight(code, lang), [code, lang]);

  const highlightedLines = React.useMemo(
    () => lines.map((line) => highlight(line, lang) || " "),
    [lines, lang]
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <figure className={cn("code-block not-prose", useLineNumbers && "code-block--numbered")} dir="ltr">
      <figcaption className="code-block-header">
        <div className="code-block-meta">
          <span className="code-block-icon" aria-hidden>
            <Terminal className="h-3.5 w-3.5" />
          </span>
          <span className="code-block-lang">{formatLanguageLabel(lang)}</span>
          {lineCount > 1 && (
            <span className="code-block-lines">{toPersianDigits(lineCount)} خط</span>
          )}
        </div>
        <button
          type="button"
          onClick={copy}
          data-copied={copied ? "true" : "false"}
          className="code-block-copy"
          aria-label={copied ? "کد کپی شد" : "کپی کد"}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" aria-hidden />
              <span>کپی شد</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" aria-hidden />
              <span>کپی</span>
            </>
          )}
        </button>
      </figcaption>

      <div className="code-block-body">
        {useLineNumbers && (
          <div className="code-block-gutter" aria-hidden>
            {lines.map((_, i) => (
              <span key={i} className="code-block-gutter-line">
                {toPersianDigits(i + 1)}
              </span>
            ))}
          </div>
        )}
        <pre className="code-block-pre">
          <code
            className="code-block-code"
            dangerouslySetInnerHTML={{
              __html: useLineNumbers ? highlightedLines.join("\n") : highlighted,
            }}
          />
        </pre>
      </div>
    </figure>
  );
}
