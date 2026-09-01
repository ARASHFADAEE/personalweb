"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";

type Props = { content: string };

export function MarkdownRenderer({ content }: Props) {
  return (
    <div className="prose-article">
      <ReactMarkdown
        components={{
          a: ({ href, children, ...props }) => {
            if (!href) return <a {...props}>{children}</a>;
            const external = href.startsWith("http");
            if (external) {
              return (
                <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
                  {children}
                </a>
              );
            }
            return <Link href={href} {...props}>{children}</Link>;
          },
          code: ({ className, children, ...props }) => {
            // inline code (no language class, or inline)
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
          pre: ({ children }) => <>{children}</>,
          img: ({ src, alt, ...props }) =>
            src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={typeof src === "string" ? src : ""} alt={alt ?? ""} {...props} />
            ) : null,
        }}
        skipHtml
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
