import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

type ProjectDescriptionProps = {
  content: string;
  className?: string;
  clamp?: 2 | 3;
  inverted?: boolean;
};

export function ProjectDescription({
  content,
  className,
  clamp,
  inverted = false,
}: ProjectDescriptionProps) {
  if (!content?.trim()) return null;

  return (
    <div
      className={cn(
        "project-description text-pretty [&_a]:underline [&_a]:underline-offset-2",
        inverted
          ? "[&_a]:text-white/90 [&_em]:text-white/85 [&_p]:text-white/80 [&_strong]:text-white"
          : "[&_a]:text-primary [&_em]:italic [&_em]:text-muted-foreground [&_p]:text-muted-foreground [&_strong]:font-semibold [&_strong]:text-foreground",
        "[&_blockquote]:my-2 [&_blockquote]:border-r-2 [&_blockquote]:border-primary/40 [&_blockquote]:pr-3 [&_blockquote]:text-sm",
        "[&_li]:my-0.5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pr-4 [&_p]:m-0 [&_p+p]:mt-2 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pr-4",
        clamp === 2 && "line-clamp-2",
        clamp === 3 && "line-clamp-3",
        className
      )}
    >
      <ReactMarkdown
        allowedElements={["p", "strong", "em", "a", "ul", "ol", "li", "blockquote", "br"]}
        unwrapDisallowed
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
