import { useState } from "react";
import { ArrowDown, ArrowUp, Check, Clock, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useVdash } from "@/lib/vdash/store";
import type { Priority, Task } from "@/lib/vdash/types";
import { cn } from "@/lib/utils";

const PRIORITY_STYLES: Record<Priority, string> = {
  high: "bg-priority-high/12 text-priority-high border-priority-high/25",
  medium: "bg-priority-medium/15 text-priority-medium border-priority-medium/30",
  low: "bg-priority-low/12 text-priority-low border-priority-low/25",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      className={cn(
        "rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        PRIORITY_STYLES[priority],
      )}
    >
      {priority}
    </span>
  );
}

function TaskRow({ task }: { task: Task }) {
  const { toggleTask, removeTask, updateTask, moveTask } = useVdash();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [timeBlock, setTimeBlock] = useState(task.timeBlock);

  return (
    <li
      className={cn(
        "animate-rise group flex flex-col gap-3 rounded-xl border border-border bg-card p-3.5 transition-all hover:shadow-soft sm:flex-row sm:items-center",
        task.done && "opacity-60",
      )}
    >
      <button
        onClick={() => toggleTask(task.id)}
        aria-label={task.done ? "Mark as not done" : "Mark as done"}
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors",
          task.done
            ? "border-transparent bg-brand-gradient text-primary-foreground"
            : "border-border hover:border-primary",
        )}
      >
        {task.done && <Check className="h-3.5 w-3.5" />}
      </button>

      <div className="min-w-0 flex-1">
        {editing ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="flex-1" />
            <Input
              value={timeBlock}
              onChange={(e) => setTimeBlock(e.target.value)}
              className="sm:w-40"
            />
            <Button
              size="sm"
              variant="gradient"
              onClick={() => {
                updateTask(task.id, { title, timeBlock });
                setEditing(false);
                toast.success("Task updated");
              }}
            >
              Save
            </Button>
          </div>
        ) : (
          <>
            <p className={cn("text-sm font-medium", task.done && "line-through")}>{task.title}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {task.timeBlock} · {task.duration}
              </span>
              <span className="rounded-full bg-secondary px-2 py-0.5 font-medium">{task.day}</span>
              <PriorityBadge priority={task.priority} />
            </div>
            <p className="mt-1.5 text-[11px] italic text-muted-foreground">{task.note}</p>
          </>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Select
          value={task.priority}
          onValueChange={(v) => updateTask(task.id, { priority: v as Priority })}
        >
          <SelectTrigger className="h-8 w-[104px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Move up"
          onClick={() => moveTask(task.id, -1)}
        >
          <ArrowUp />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Move down"
          onClick={() => moveTask(task.id, 1)}
        >
          <ArrowDown />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Edit task"
          onClick={() => setEditing((e) => !e)}
        >
          <Pencil />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Delete task"
          onClick={() => {
            removeTask(task.id);
            toast.success("Task deleted");
          }}
        >
          <Trash2 />
        </Button>
      </div>
    </li>
  );
}

export function TaskList({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        No tasks yet. Generate a plan in the Task Planner to get started.
      </p>
    );
  }
  return (
    <ul className="space-y-2.5">
      {tasks.map((t) => (
        <TaskRow key={t.id} task={t} />
      ))}
    </ul>
  );
}
