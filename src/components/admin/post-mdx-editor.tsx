"use client";

import * as React from "react";
import {
  MDXEditor,
  type MDXEditorMethods,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  linkPlugin,
  linkDialogPlugin,
  tablePlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  CodeMirrorEditor,
  markdownShortcutPlugin,
  toolbarPlugin,
  imagePlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  ListsToggle,
  CreateLink,
  InsertThematicBreak,
  InsertTable,
  InsertCodeBlock,
  InsertImage,
  Separator,
  CodeToggle,
  ConditionalContents,
  ChangeCodeMirrorLanguage,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import { Button } from "@/components/ui/button";

/** Strip characters that often break Lexical / MDX parsing after paste. */
export function sanitizeEditorMarkdown(input: string): string {
  return input
    .replace(/\0/g, "")
    .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/\uFEFF/g, "")
    .replace(/\r\n/g, "\n");
}

async function uploadEditorImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("files", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body: form });
  const data = (await res.json()) as { urls?: string[]; error?: string };
  if (!res.ok || !data.urls?.[0]) {
    throw new Error(data.error ?? "آپلود تصویر ناموفق بود");
  }
  return data.urls[0];
}

const CODE_BLOCK_LANGUAGES = {
  "": "Plain text",
  text: "Plain text",
  js: "JavaScript",
  javascript: "JavaScript",
  ts: "TypeScript",
  tsx: "TypeScript (React)",
  jsx: "JavaScript (React)",
  css: "CSS",
  html: "HTML",
  json: "JSON",
  bash: "Bash",
  sh: "Shell",
  shell: "Shell",
  python: "Python",
  py: "Python",
  sql: "SQL",
  md: "Markdown",
  markdown: "Markdown",
  yaml: "YAML",
  yml: "YAML",
  php: "PHP",
  graphql: "GraphQL",
  dockerfile: "Dockerfile",
  prisma: "Prisma",
} as const;

type Props = {
  initialMarkdown: string;
  editorKey: string;
  onMarkdownChange?: (markdown: string) => void;
  editorRef?: React.Ref<MDXEditorMethods>;
};

export function PostMdxEditor({
  initialMarkdown,
  editorKey,
  onMarkdownChange,
  editorRef,
}: Props) {
  const innerRef = React.useRef<MDXEditorMethods>(null);

  React.useImperativeHandle(editorRef, () => innerRef.current as MDXEditorMethods);

  return (
    <MDXEditor
      key={editorKey}
      ref={innerRef}
      markdown={initialMarkdown}
      onChange={(md) => onMarkdownChange?.(sanitizeEditorMarkdown(md))}
      plugins={[
        headingsPlugin(),
        listsPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        linkPlugin(),
        linkDialogPlugin(),
        tablePlugin(),
        codeBlockPlugin({
          defaultCodeBlockLanguage: "text",
          codeBlockEditorDescriptors: [
            { priority: -10, match: () => true, Editor: CodeMirrorEditor },
          ],
        }),
        codeMirrorPlugin({ codeBlockLanguages: CODE_BLOCK_LANGUAGES }),
        markdownShortcutPlugin(),
        imagePlugin({ imageUploadHandler: uploadEditorImage }),
        toolbarPlugin({
          toolbarContents: () => (
            <ConditionalContents
              options={[
                {
                  when: (editor) => editor?.editorType === "codeblock",
                  contents: () => <ChangeCodeMirrorLanguage />,
                },
                {
                  fallback: () => (
                    <>
                      <UndoRedo />
                      <Separator />
                      <BlockTypeSelect />
                      <BoldItalicUnderlineToggles />
                      <CodeToggle />
                      <Separator />
                      <ListsToggle />
                      <Separator />
                      <CreateLink />
                      <InsertImage />
                      <InsertTable />
                      <InsertThematicBreak />
                      <InsertCodeBlock />
                    </>
                  ),
                },
              ]}
            />
          ),
        }),
      ]}
      placeholder="شروع به نوشتن کنید… (Markdown پشتیبانی می‌شود)"
      contentEditableClassName="prose-article min-h-[420px] p-5 text-right"
    />
  );
}

type BoundaryProps = {
  children: React.ReactNode;
  onRetry: () => void;
};

type BoundaryState = { hasError: boolean };

export class MdxEditorErrorBoundary extends React.Component<
  BoundaryProps,
  BoundaryState
> {
  state: BoundaryState = { hasError: false };

  static getDerivedStateFromError(): BoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("[PostMdxEditor]", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-6 text-center">
          <p className="font-medium text-destructive">خطا در ویرایشگر متن</p>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            احتمالاً متن paste‌شده شامل فرمت پیچیده (Word/HTML) است.
            <br />
            ابتدا متن را در Notepad ساده کنید یا با Ctrl+Shift+V (Paste as plain text) دوباره paste کنید.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={() => {
              this.setState({ hasError: false });
              this.props.onRetry();
            }}
          >
            تلاش مجدد
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
