import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarClock, Plus, Sparkle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Disclaimer, PageHeader } from "@/components/vdash/app-shell";
import { Markdown } from "@/components/vdash/markdown";
import { TaskList } from "@/components/vdash/task-list";
import { generatePlan, planSummary } from "@/lib/vdash/mock-ai";
import { useVdash } from "@/lib/vdash/store";
import { uid, type Task } from "@/lib/vdash/types";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — V-dash" },
      {
        name: "description",
        content:
          "Turn a raw task list into a prioritised daily or weekly schedule with time blocks and optimisation tips.",
      },
      { property: "og:title", content: "AI Task Planner — V-dash" },
      {
        property: "og:description",
        content: "Prioritise by urgency and importance, then edit your generated schedule.",
      },
    ],
  }),
  component: PlannerPage,
});

const SAMPLE = `Finalise Q3 client proposal
Review vendor contract renewal terms
Prepare team stand-up notes
Update onboarding documentation
Reply to supplier emails
Tidy shared drive folders`;

function PlannerPage() {
  const { tasks, addTasks, logHistory } = useVdash();
  const [raw, setRaw] = useState("");
  const [mode, setMode] = useState<"daily" | "weekly">("daily");
  const [summary, setSummary] = useState("");
  const [generating, setGenerating] = useState(false);
  const [quick, setQuick] = useState("");

  const generate = () => {
    const lines = raw
      .split("\n")
      .map((l) => l.replace(/^[-•*\d.\s]+/, "").trim())
      .filter(Boolean);
    if (lines.length === 0) {
      toast.error("Add at least one task first");
      return;
    }
    setGenerating(true);
    window.setTimeout(() => {
      const plan: Task[] = generatePlan(lines, mode);
      addTasks(plan);
      setSummary(planSummary(plan, mode));
      setGenerating(false);
      logHistory({
        kind: "plan",
        label: `${mode === "daily" ? "Daily" : "Weekly"} plan generated`,
        detail: `${plan.length} tasks scheduled`,
      });
      toast.success("Plan generated");
    }, 900);
  };

  const addQuick = () => {
    if (!quick.trim()) return;
    addTasks([
      {
        id: uid(),
        title: quick.trim(),
        priority: "medium",
        timeBlock: "15:45 – 16:30",
        duration: "45 min",
        note: "Added manually — adjust the priority and time block as needed.",
        done: false,
        day: mode === "daily" ? "Today" : "Monday",
      },
    ]);
    setQuick("");
    toast.success("Task added");
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 px-4 py-5 sm:px-6 lg:py-7">
      <PageHeader
        title="AI Task Planner"
        subtitle="Paste your tasks and V-dash will prioritise them by urgency and importance."
      />

      <div className="card-surface space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Tabs value={mode} onValueChange={(v) => setMode(v as "daily" | "weekly")}>
            <TabsList>
              <TabsTrigger value="daily">Daily plan</TabsTrigger>
              <TabsTrigger value="weekly">Weekly plan</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="ghost" size="sm" onClick={() => setRaw(SAMPLE)}>
            Use sample tasks
          </Button>
        </div>

        <Textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder={"One task per line, e.g.\nFinalise Q3 client proposal\nReview vendor contract"}
          className="min-h-40 text-sm"
        />

        <div className="flex flex-wrap gap-2">
          <Button variant="gradient" onClick={generate} disabled={generating}>
            <Sparkle className="h-4 w-4" />
            {generating ? "Planning…" : `Generate ${mode} plan`}
          </Button>
          <div className="flex flex-1 gap-2 sm:max-w-sm">
            <Input
              value={quick}
              onChange={(e) => setQuick(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addQuick()}
              placeholder="Add a single task"
            />
            <Button variant="outline" onClick={addQuick} aria-label="Add task">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {summary && (
        <div className="card-surface bg-tiedye animate-rise p-5">
          <h2 className="flex items-center gap-2 text-base font-bold">
            <CalendarClock className="h-4 w-4 text-primary" />
            V-dash plan overview
          </h2>
          <div className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{summary}</div>
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-lg font-bold">Your schedule</h2>
        <TaskList tasks={tasks} />
      </div>

      <div className="card-surface p-5">
        <h2 className="text-base font-bold">Time optimisation suggestions</h2>
        <Markdown className="mt-2 text-muted-foreground">
          {`- **Deep work first.** Schedule high-priority work before 11:00 while focus is strongest.
- **Batch shallow work.** Group emails, approvals and admin into one 45-minute afternoon block.
- **Buffer between blocks.** 15 minutes between sessions prevents overruns cascading.
- **End-of-day review.** Reserve the last 30 minutes to close loops and set up tomorrow.`}
        </Markdown>
      </div>

      <Disclaimer />
    </div>
  );
}
