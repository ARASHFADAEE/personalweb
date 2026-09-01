"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

type CodeBlockProps = {
  language: string;
  code: string;
  showLineNumbers?: boolean;
};

// Lightweight syntax highlighter — regex-based tokenizer for common languages.
// Avoids heavy deps like react-syntax-highlighter's full prism bundle.
const TOKEN_REGEX: Array<{ lang: string | "any"; re: RegExp; cls: string }> = [
  { lang: "any", re: /(\/\/[^\n]*|#[^\n]*|\/\*[\s\S]*?\*\/)/g, cls: "tok-com" },
  { lang: "any", re: /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)/g, cls: "tok-str" },
  { lang: "any", re: /\b(\d+\.?\d*)\b/g, cls: "tok-num" },
  { lang: "any", re: /\b(const|let|var|function|return|if|else|for|while|switch|case|break|continue|new|class|extends|import|from|export|default|async|await|try|catch|finally|throw|typeof|instanceof|in|of|this|super|void|delete|yield|static|public|private|protected|readonly|interface|type|enum|namespace|implements|declare|as|is|keyof|infer|satisfies)\b/g, cls: "tok-kw" },
  { lang: "any", re: /\b(true|false|null|undefined|NaN|Infinity|window|document|console|Math|JSON|Promise|Array|Object|String|Number|Boolean|Map|Set|Date|RegExp|Error)\b/g, cls: "tok-glb" },
  { lang: "ts", re: /\b(string|number|boolean|any|unknown|never|void|object|symbol|bigint)\b/g, cls: "tok-type" },
  { lang: "py", re: /\b(def|elif|lambda|pass|with|as|not|and|or|is|None|True|False|self|print|range|len|str|int|float|list|dict|tuple|set)\b/g, cls: "tok-kw" },
  { lang: "sql", re: /\b(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|JOIN|INNER|LEFT|RIGHT|ON|GROUP|ORDER|BY|HAVING|LIMIT|OFFSET|VALUES|INTO|AND|OR|NOT|CREATE|TABLE|INDEX|PRIMARY|KEY|FOREIGN|REFERENCES|ALTER|ADD|DROP|UNIQUE|DEFAULT)\b/g, cls: "tok-kw" },
];

const LANG_MAP: Record<string, string> = {
  ts: "ts", tsx: "ts", typescript: "ts", js: "ts", jsx: "ts", javascript: "ts",
  py: "py", python: "py",
  sql: "sql", postgres: "sql",
  bash: "bash", sh: "bash", shell: "bash", zsh: "bash",
  css: "css", scss: "css",
  html: "html", xml: "html",
  json: "json",
  dockerfile: "bash",
  yml: "yaml", yaml: "yaml",
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function highlight(code: string, language: string): string {
  const lang = LANG_MAP[language.toLowerCase()] ?? "any";
  const tokens = TOKEN_REGEX.filter((t) => t.lang === "any" || t.lang === lang);

  // Build a list of matches with positions, then merge non-overlapping
  type Match = { start: number; end: number; cls: string };
  const matches: Match[] = [];
  for (const t of tokens) {
    t.re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = t.re.exec(code)) !== null) {
      matches.push({ start: m.index, end: m.index + m[0].length, cls: t.cls });
    }
  }
  // sort by start, prefer earlier tokens to win
  matches.sort((a, b) => a.start - b.start || a.end - b.end);
  // filter overlaps (keep first)
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

export function CodeBlock({ language, code, showLineNumbers = false }: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  };

  const lang = language || "text";
  const highlighted = React.useMemo(() => highlight(code, lang), [code, lang]);
  const lines = React.useMemo(() => code.split("\n"), [code]);

  return (
    <div className="code-block group">
      <div className="code-block-header">
        <span className="code-block-lang">{lang}</span>
        <button
          onClick={copy}
          className="inline-flex min-h-9 min-w-[4.5rem] items-center justify-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
          aria-label={copied ? "کد کپی شد" : "کپی کد"}
        >
          {copied ? (
            <><Check className="h-3.5 w-3.5 text-success" /> کپی شد</>
          ) : (
            <><Copy className="h-3.5 w-3.5" /> کپی</>
          )}
        </button>
      </div>
      <pre>
        <code
          dangerouslySetInnerHTML={{
            __html: showLineNumbers
              ? lines
                  .map(
                    (line, i) =>
                      `<span class="line-number">${String(i + 1).padStart(2, " ").replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d])}</span>${highlight(line, lang) || " "}`
                  )
                  .join("\n")
              : highlighted,
          }}
        />
      </pre>
      <style>{`
        .tok-com { color: oklch(0.6 0.02 240); font-style: italic; }
        .tok-str { color: oklch(0.75 0.16 150); }
        .tok-num { color: oklch(0.78 0.17 70); }
        .tok-kw  { color: oklch(0.72 0.16 305); font-weight: 600; }
        .tok-glb { color: oklch(0.7 0.13 230); }
        .tok-type { color: oklch(0.7 0.15 165); }
      `}</style>
    </div>
  );
}
