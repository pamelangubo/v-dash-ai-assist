import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bookmark, Copy, Maximize2, Pencil, RefreshCw, Search, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Disclaimer, PageHeader } from "@/components/vdash/app-shell";
import { Markdown } from "@/components/vdash/markdown";
import { generateResearch } from "@/lib/vdash/mock-ai";
import { useVdash } from "@/lib/vdash/store";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — V-dash" },
      {
        name: "description",
        content:
          "Paste a topic, article or report and get a summary, key insights, findings and recommendations you can edit and save.",
      },
      { property: "og:title", content: "AI Research Assistant — V-dash" },
      {
        property: "og:description",
        content: "Summaries, insights and recommendations you can simplify, expand or save.",
      },
    ],
  }),
  component: ResearchPage,
});

function ResearchPage() {
  const { saveResearch, logHistory } = useVdash();
  const [topic, setTopic] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const run = (style: "standard" | "simple" | "expanded") => {
    if (!topic.trim()) {
      toast.error("Enter a topic or paste some text first");
      return;
    }
    setLoading(true);
    setEditing(false);
    window.setTimeout(() => {
      setOutput(generateResearch(topic, style));
      setLoading(false);
      logHistory({ kind: "research", label: "Research generated", detail: topic.slice(0, 90) });
    }, 950);
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 px-4 py-5 sm:px-6 lg:py-7">
      <PageHeader
        title="AI Research Assistant"
        subtitle="Enter a topic or paste an article, report or notes for V-dash to analyse."
      />

      <div className="card-surface space-y-4 p-5">
        <Textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. Hybrid work productivity benchmarks 2026 — or paste a full article here…"
          className="min-h-40 text-sm"
        />
        <div className="flex flex-wrap gap-2">
          <Button variant="gradient" onClick={() => run("standard")} disabled={loading}>
            <Search className="h-4 w-4" />
            {loading ? "Researching…" : "Analyse with V-dash"}
          </Button>
          <Button
            variant="outline"
            onClick={() => setTopic("Hybrid work productivity benchmarks 2026")}
          >
            Use sample topic
          </Button>
        </div>
      </div>

      {output && (
        <div className="card-surface animate-rise space-y-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-bold">Research brief</h2>
            <div className="flex flex-wrap gap-1.5">
              <Button variant="ghost" size="sm" onClick={() => setEditing((e) => !e)}>
                <Pencil className="h-4 w-4" />
                {editing ? "Preview" : "Edit"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigator.clipboard?.writeText(output);
                  toast.success("Copied to clipboard");
                }}
              >
                <Copy className="h-4 w-4" />
                Copy
              </Button>
              <Button variant="ghost" size="sm" onClick={() => run("simple")}>
                <Wand2 className="h-4 w-4" />
                Simplify
              </Button>
              <Button variant="ghost" size="sm" onClick={() => run("expanded")}>
                <Maximize2 className="h-4 w-4" />
                Expand
              </Button>
              <Button variant="ghost" size="sm" onClick={() => run("standard")}>
                <RefreshCw className="h-4 w-4" />
                Regenerate
              </Button>
              <Button
                variant="gradient"
                size="sm"
                onClick={() => {
                  saveResearch(topic.slice(0, 90), output);
                  toast.success("Saved to Saved Research");
                }}
              >
                <Bookmark className="h-4 w-4" />
                Save
              </Button>
            </div>
          </div>

          {editing ? (
            <Textarea
              value={output}
              onChange={(e) => setOutput(e.target.value)}
              className="min-h-[420px] font-mono text-xs"
            />
          ) : (
            <Markdown>{output}</Markdown>
          )}
        </div>
      )}

      <Disclaimer />
    </div>
  );
}
