import { Bookmark, CheckCircle2, Flame, ListTodo } from "lucide-react";
import { useVdash } from "@/lib/vdash/store";

export function StatCards() {
  const { tasks, research } = useVdash();
  const today = tasks.filter((t) => t.day === "Today");
  const stats = [
    { label: "Tasks Today", value: today.length || tasks.length, icon: ListTodo },
    { label: "Completed", value: tasks.filter((t) => t.done).length, icon: CheckCircle2 },
    {
      label: "High Priority",
      value: tasks.filter((t) => t.priority === "high" && !t.done).length,
      icon: Flame,
    },
    { label: "Saved Research", value: research.length, icon: Bookmark },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map(({ label, value, icon: Icon }, i) => (
        <div
          key={label}
          className="card-surface animate-rise p-4 transition-shadow hover:shadow-lift"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">{label}</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Icon className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="mt-2 font-display text-2xl font-extrabold">{value}</div>
        </div>
      ))}
    </div>
  );
}
