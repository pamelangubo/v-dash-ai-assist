import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { uid, type ChatMessage, type HistoryEntry, type ResearchDoc, type Task } from "./types";

const STORAGE_KEY = "vdash-state-v1";

export const GREETING: ChatMessage = {
  id: "greeting",
  role: "assistant",
  content: `Hi, I'm **V-dash**, your AI workplace productivity assistant. How can I help you today?

Would you like help with your **tasks**, **research**, or something else?`,
  createdAt: 0,
};

const SEED_TASKS: Task[] = [
  {
    id: "seed-1",
    title: "Finalise Q3 client proposal",
    priority: "high",
    timeBlock: "08:30 – 09:15",
    duration: "45 min",
    note: "Protect this slot — deep focus, notifications off.",
    done: false,
    day: "Today",
  },
  {
    id: "seed-2",
    title: "Review vendor contract renewal terms",
    priority: "high",
    timeBlock: "09:30 – 10:45",
    duration: "75 min",
    note: "Do this while your energy peaks; it unblocks procurement.",
    done: false,
    day: "Today",
  },
  {
    id: "seed-3",
    title: "Prepare team stand-up notes",
    priority: "medium",
    timeBlock: "11:00 – 12:00",
    duration: "60 min",
    note: "Batch with similar work to avoid context switching.",
    done: true,
    day: "Today",
  },
  {
    id: "seed-4",
    title: "Update onboarding documentation",
    priority: "medium",
    timeBlock: "13:30 – 14:30",
    duration: "60 min",
    note: "Timebox strictly — stop at the block end and review.",
    done: false,
    day: "Today",
  },
  {
    id: "seed-5",
    title: "Tidy shared drive folders",
    priority: "low",
    timeBlock: "16:45 – 17:15",
    duration: "30 min",
    note: "Delegate or defer if the day runs long.",
    done: false,
    day: "Today",
  },
];

const SEED_RESEARCH: ResearchDoc[] = [
  {
    id: "seed-r1",
    topic: "Hybrid work productivity benchmarks 2026",
    content:
      "## Summary — Hybrid work productivity benchmarks 2026\n\nHybrid teams now match or exceed fully in-office output when meeting load is controlled and asynchronous documentation is strong.\n\n## Key insights\n1. Meeting hours, not location, predict output.\n2. Written status updates cut sync time by ~30%.\n3. Two anchor days in-office capture most collaboration benefit.\n\n## Recommendations\n- Cap recurring meetings at 4 hours per week per person.\n- Standardise a weekly written update format.",
    createdAt: Date.now() - 1000 * 60 * 60 * 26,
  },
];

type State = {
  tasks: Task[];
  research: ResearchDoc[];
  messages: ChatMessage[];
  history: HistoryEntry[];
};

type Store = State & {
  setTasks: (updater: (t: Task[]) => Task[]) => void;
  addTasks: (tasks: Task[]) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  moveTask: (id: string, dir: -1 | 1) => void;
  saveResearch: (topic: string, content: string) => void;
  removeResearch: (id: string) => void;
  setMessages: (updater: (m: ChatMessage[]) => ChatMessage[]) => void;
  resetChat: () => void;
  logHistory: (entry: Omit<HistoryEntry, "id" | "createdAt">) => void;
  clearHistory: () => void;
};

const Ctx = createContext<Store | null>(null);

const initialState: State = {
  tasks: SEED_TASKS,
  research: SEED_RESEARCH,
  messages: [GREETING],
  history: [],
};

export function VdashProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initialState);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...initialState, ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

  const value = useMemo<Store>(() => {
    const patch = (p: Partial<State>) => setState((s) => ({ ...s, ...p }));
    return {
      ...state,
      setTasks: (updater) => setState((s) => ({ ...s, tasks: updater(s.tasks) })),
      addTasks: (tasks) => setState((s) => ({ ...s, tasks: [...tasks, ...s.tasks] })),
      toggleTask: (id) =>
        setState((s) => ({
          ...s,
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
        })),
      removeTask: (id) => setState((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) })),
      updateTask: (id, p) =>
        setState((s) => ({ ...s, tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...p } : t)) })),
      moveTask: (id, dir) =>
        setState((s) => {
          const arr = [...s.tasks];
          const i = arr.findIndex((t) => t.id === id);
          const j = i + dir;
          if (i < 0 || j < 0 || j >= arr.length) return s;
          [arr[i], arr[j]] = [arr[j]!, arr[i]!];
          return { ...s, tasks: arr };
        }),
      saveResearch: (topic, content) =>
        setState((s) => ({
          ...s,
          research: [{ id: uid(), topic, content, createdAt: Date.now() }, ...s.research],
        })),
      removeResearch: (id) =>
        setState((s) => ({ ...s, research: s.research.filter((r) => r.id !== id) })),
      setMessages: (updater) => setState((s) => ({ ...s, messages: updater(s.messages) })),
      resetChat: () => patch({ messages: [GREETING] }),
      logHistory: (entry) =>
        setState((s) => ({
          ...s,
          history: [{ ...entry, id: uid(), createdAt: Date.now() }, ...s.history].slice(0, 60),
        })),
      clearHistory: () => patch({ history: [] }),
    };
  }, [state]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useVdash() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useVdash must be used inside VdashProvider");
  return ctx;
}
