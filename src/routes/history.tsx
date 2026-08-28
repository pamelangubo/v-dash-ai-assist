import { createFileRoute } from "@tanstack/react-router";
import { CalendarClock, MessageSquareText, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Disclaimer, PageHeader } from "@/components/vdash/app-shell";
import { useVdash } from "@/lib/vdash/store";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "History — V-dash" },
      {
        name: "description",
        content: "A timeline of your V-dash chats, generated plans and research briefs.",
      },
      { property: "og:title", content: "History — V-dash" },
      { property: "og:description", content: "Recent activity across chat, planning and research." },
    ],
  }),
  component: HistoryPage,
});

const ICONS = {
  chat: MessageSquareText,
  plan: CalendarClock,
  research: Search,
} as const;

function HistoryPage() {
  const { history, clearHistory } = useVdash();

  return (
    <div className="mx-auto w-full max-w-4xl space-y-5 px-4 py-5 sm:px-6 lg:py-7">
      <PageHeader
        title="History"
        subtitle="Recent activity across chat, planning and research."
        action={
          history.length > 0 ? (
            <Button variant="outline" size="sm" onClick={clearHistory}>
              Clear history
            </Button>
          ) : undefined
        }
      />

      {history.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No activity yet. Ask V-dash something and it will show up here.
        </p>
      ) : (
        <ol className="space-y-2.5">
          {history.map((h) => {
            const Icon = ICONS[h.kind];
            return (
              <li key={h.id} className="card-surface animate-rise flex items-start gap-3 p-4">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{h.label}</p>
                  <p className="truncate text-xs text-muted-foreground">{h.detail}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {new Date(h.createdAt).toLocaleString()}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <Disclaimer />
    </div>
  );
}
