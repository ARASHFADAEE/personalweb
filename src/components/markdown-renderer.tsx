"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { slugifyHeading, type Heading } from "@/lib/headings";
import { normalizeMarkdownTables } from "@/lib/markdown-tables";
import { cn } from "@/lib/utils";

type Props = {
  content: string;
  headings?: Heading[];
  coverImage?: string | null;
};

const CALLOUT_TYPES = ["INFO", "TIP", "WARNING", "IMPORTANT", "SUCCESS", "NOTE"] as const;
type CalloutType = (typeof CALLOUT_TYPES)[number];

const CALLOUT_LABELS: Record<CalloutType, string> = {
  INFO: "اطلاعات",
  TIP: "نکته",
  WARNING: "هشدار",
  IMPORTANT: "مهم",
  SUCCESS: "موفقیت",
  NOTE: "یادداشت",
};

function getHeadingText(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(getHeadingText).join("");
  if (React.isValidElement<{ children?: React.ReactNode }>(children)) {
    return getHeadingText(children.props.children);
  }
  return "";
}

function parseCallout(text: string): { type: CalloutType; body: string } | null {
  const match = /^\[!(INFO|TIP|WARNING|IMPORTANT|SUCCESS|NOTE)\]\s*/i.exec(text.trim());
  if (!match) return null;
  const type = match[1].toUpperCase() as CalloutType;
  return { type, body: text.trim().slice(match[0].length).trim() };
}

function useHeadingIdAssigner() {
  const usedIds = React.useRef(new Set<string>());

  return React.useCallback((text: string) => {
    let id = slugifyHeading(text);
    if (usedIds.current.has(id)) {
      let i = 2;
      while (usedIds.current.has(`${id}-${i}`)) i += 1;
      id = `${id}-${i}`;
    }
    usedIds.current.add(id);
    return id;
  }, []);
}

function createHeadingComponent(
  Tag: "h2" | "h3" | "h4",
  level: number,
  headings: Heading[] | undefined,
  indexRef: React.MutableRefObject<number>,
  assignId: (text: string) => string
) {
  return function Heading({
    children,
    ...props
  }: React.HTMLAttributes<HTMLHeadingElement>) {
    const text = getHeadingText(children).replace(/[#*_`~]/g, "").trim();
    let id: string | undefined;

    const planned = headings?.[indexRef.current];
    if (planned && planned.level === level) {
      id = planned.id;
      indexRef.current += 1;
    } else if (text) {
      id = assignId(text);
    }

    return (
      <Tag id={id} className="scroll-mt-28" {...props}>
        {children}
      </Tag>
    );
  };
}

function normalizeMarkdown(input: string): string {
  return normalizeMarkdownTables(input.replace(/^\*\*\*\s*$/gm, "\n---\n"));
}

export function MarkdownRenderer({ content, headings, coverImage }: Props) {
  const assignId = useHeadingIdAssigner();
  const headingIndexRef = React.useRef(0);
  const skippedCoverRef = React.useRef(false);
  const markdown = React.useMemo(() => normalizeMarkdown(content), [content]);

  const components = React.useMemo(
    () => ({
      h2: createHeadingComponent("h2", 2, headings, headingIndexRef, assignId),
      h3: createHeadingComponent("h3", 3, headings, headingIndexRef, assignId),
      h4: createHeadingComponent("h4", 4, headings, headingIndexRef, assignId),
      a: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
        if (!href) return <a {...props}>{children}</a>;
        const external = href.startsWith("http");
        if (external) {
          return (
            <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
              {children}
            </a>
          );
        }
        return (
          <Link href={href} {...props}>
            {children}
          </Link>
        );
      },
      blockquote: ({ children }: { children?: React.ReactNode }) => {
        const childArray = React.Children.toArray(children);
        const firstText = childArray.length > 0 ? getHeadingText(childArray[0]) : getHeadingText(children);
        const callout = parseCallout(firstText);

        if (callout) {
          const type = callout.type === "NOTE" ? "INFO" : callout.type;
          const restFromFirst = firstText.replace(/^\[!(INFO|TIP|WARNING|IMPORTANT|SUCCESS|NOTE)\]\s*/i, "").trim();
          const restNodes = childArray.slice(1);
          return (
            <aside
              className={cn("article-callout", `article-callout--${type.toLowerCase()}`)}
              role="note"
              aria-label={CALLOUT_LABELS[type]}
            >
              <p className="article-callout-label">{CALLOUT_LABELS[type]}</p>
              <div className="article-callout-body">
                {restFromFirst && <p>{restFromFirst}</p>}
                {restNodes}
              </div>
            </aside>
          );
        }
        return <blockquote>{children}</blockquote>;
      },
      table: ({ children, ...props }: React.TableHTMLAttributes<HTMLTableElement>) => (
        <div className="article-table-wrap">
          <table {...props}>{children}</table>
        </div>
      ),
      code: ({
        className,
        children,
        ...props
      }: React.HTMLAttributes<HTMLElement>) => {
        const text = String(children ?? "").replace(/\n$/, "");
        const match = /language-([\w-]+)/.exec(className ?? "");
        const language = match?.[1] ?? "text";
        const isBlock = Boolean(match) || text.includes("\n");

        if (isBlock) {
          return (
            <CodeBlock
              language={language}
              code={text}
              showLineNumbers={text.split("\n").length > 6}
            />
          );
        }

        return (
          <code className={className} {...props}>
            {children}
          </code>
        );
      },
      pre: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
      img: ({ src, alt, title, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => {
        const srcStr = typeof src === "string" ? src : "";
        if (!srcStr) return null;

        if (
          coverImage &&
          !skippedCoverRef.current &&
          (srcStr === coverImage || srcStr.endsWith(coverImage) || coverImage.endsWith(srcStr))
        ) {
          skippedCoverRef.current = true;
          return null;
        }

        return (
          <figure className="article-inline-figure">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={srcStr}
              alt={alt?.trim() || ""}
              loading="lazy"
              decoding="async"
              {...props}
            />
            {(title || alt) && (
              <figcaption className="article-inline-caption">{title || alt}</figcaption>
            )}
          </figure>
        );
      },
    }),
    [assignId, headings, coverImage]
  );

  return (
    <div className="prose-article">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components} skipHtml>
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
