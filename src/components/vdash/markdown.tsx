import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div className={cn("vdash-md space-y-3 text-sm leading-relaxed", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: (p) => <h1 className="mt-4 text-xl font-bold first:mt-0" {...p} />,
          h2: (p) => <h2 className="mt-5 text-base font-bold first:mt-0" {...p} />,
          h3: (p) => <h3 className="mt-4 text-sm font-semibold first:mt-0" {...p} />,
          p: (p) => <p className="leading-relaxed" {...p} />,
          ul: (p) => <ul className="ml-5 list-disc space-y-1.5" {...p} />,
          ol: (p) => <ol className="ml-5 list-decimal space-y-1.5" {...p} />,
          strong: (p) => <strong className="font-semibold text-foreground" {...p} />,
          blockquote: (p) => (
            <blockquote
              className="border-l-2 border-primary/40 bg-secondary/50 py-2 pl-3 text-muted-foreground"
              {...p}
            />
          ),
          code: (p) => (
            <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[12px]" {...p} />
          ),
          table: (p) => (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs" {...p} />
            </div>
          ),
          th: (p) => <th className="border border-border bg-secondary/60 px-2 py-1.5" {...p} />,
          td: (p) => <td className="border border-border px-2 py-1.5" {...p} />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
