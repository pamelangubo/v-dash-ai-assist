import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Disclaimer, PageHeader } from "@/components/vdash/app-shell";
import { Markdown } from "@/components/vdash/markdown";
import { useVdash } from "@/lib/vdash/store";

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [
      { title: "Saved Research — V-dash" },
      {
        name: "description",
        content: "Every research brief you saved in V-dash, ready to reopen, copy or delete.",
      },
      { property: "og:title", content: "Saved Research — V-dash" },
      { property: "og:description", content: "Your library of AI research briefs." },
    ],
  }),
  component: SavedPage,
});

function SavedPage() {
  const { research, removeResearch } = useVdash();
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 px-4 py-5 sm:px-6 lg:py-7">
      <PageHeader title="Saved Research" subtitle="Your library of AI-generated briefs." />

      {research.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          Nothing saved yet. Generate a brief in the Research Assistant and hit Save.
        </p>
      ) : (
        <div className="space-y-3">
          {research.map((r) => (
            <article key={r.id} className="card-surface animate-rise p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold">{r.topic}</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Saved {new Date(r.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setOpenId(openId === r.id ? null : r.id)}
                  >
                    {openId === r.id ? "Collapse" : "Open"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Copy brief"
                    onClick={() => {
                      navigator.clipboard?.writeText(r.content);
                      toast.success("Copied to clipboard");
                    }}
                  >
                    <Copy />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Delete brief"
                    onClick={() => {
                      removeResearch(r.id);
                      toast.success("Deleted");
                    }}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>
              {openId === r.id && (
                <div className="mt-4 border-t border-border pt-4">
                  <Markdown>{r.content}</Markdown>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      <Disclaimer />
    </div>
  );
}
