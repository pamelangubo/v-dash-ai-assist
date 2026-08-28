export type Priority = "high" | "medium" | "low";

export type Task = {
  id: string;
  title: string;
  priority: Priority;
  timeBlock: string;
  duration: string;
  note: string;
  done: boolean;
  day: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
};

export type ResearchDoc = {
  id: string;
  topic: string;
  content: string;
  createdAt: number;
};

export type HistoryEntry = {
  id: string;
  kind: "chat" | "plan" | "research";
  label: string;
  detail: string;
  createdAt: number;
};

export const uid = () => Math.random().toString(36).slice(2, 10);
