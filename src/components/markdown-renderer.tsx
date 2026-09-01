"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { slugifyHeading, type Heading } from "@/lib/headings";

type Props = { content: string; headings?: Heading[] };

function getHeadingText(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(getHeadingText).join("");
  if (React.isValidElement<{ children?: React.ReactNode }>(children)) {
    return getHeadingText(children.props.children);
  }
  return "";
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
      <Tag id={id} {...props}>
        {children}
      </Tag>
    );
  };
}

export function MarkdownRenderer({ content, headings }: Props) {
  const assignId = useHeadingIdAssigner();
  const headingIndexRef = React.useRef(0);

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
      code: ({
        className,
        children,
        ...props
      }: React.HTMLAttributes<HTMLElement>) => {
        const text = String(children ?? "");
        const match = /language-(\w+)/.exec(className ?? "");
        if (!match) {
          return (
            <code className={className} {...props}>
              {children}
            </code>
          );
        }
        return (
          <CodeBlock
            language={match[1]}
            code={text.replace(/\n$/, "")}
            showLineNumbers={text.split("\n").length > 6}
          />
        );
      },
      pre: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
      img: ({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) =>
        src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={typeof src === "string" ? src : ""} alt={alt ?? ""} {...props} />
        ) : null,
    }),
    [assignId, headings]
  );

  return (
    <div className="prose-article">
      <ReactMarkdown components={components} skipHtml>
        {content}
      </ReactMarkdown>
    </div>
  );
}
