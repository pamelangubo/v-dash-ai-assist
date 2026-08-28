import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Disclaimer, PageHeader } from "@/components/vdash/app-shell";
import { StatCards } from "@/components/vdash/stat-cards";
import { TaskList } from "@/components/vdash/task-list";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useVdash } from "@/lib/vdash/store";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "My Tasks — V-dash" },
      {
        name: "description",
        content:
          "Review, edit, reorder and complete every task V-dash has planned for you across the week.",
      },
      { property: "og:title", content: "My Tasks — V-dash" },
      {
        property: "og:description",
        content: "One place for every planned task, with priorities and time blocks.",
      },
    ],
  }),
  component: TasksPage,
});

function TasksPage() {
  const { tasks } = useVdash();
  const [filter, setFilter] = useState("all");

  const filtered = tasks.filter((t) =>
    filter === "all"
      ? true
      : filter === "open"
        ? !t.done
        : filter === "done"
          ? t.done
          : t.priority === filter,
  );

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 px-4 py-5 sm:px-6 lg:py-7">
      <PageHeader title="My Tasks" subtitle="Everything V-dash has planned, in one place." />
      <StatCards />

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="done">Completed</TabsTrigger>
          <TabsTrigger value="high">High</TabsTrigger>
          <TabsTrigger value="medium">Medium</TabsTrigger>
          <TabsTrigger value="low">Low</TabsTrigger>
        </TabsList>
      </Tabs>

      <TaskList tasks={filtered} />
      <Disclaimer />
    </div>
  );
}
