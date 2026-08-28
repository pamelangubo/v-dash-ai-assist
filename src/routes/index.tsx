import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import { CalendarClock, Check, Copy, Pencil, RefreshCw, Search, Sparkle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageAction, MessageActions } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Disclaimer } from "@/components/vdash/app-shell";
import { Markdown } from "@/components/vdash/markdown";
import { StatCards } from "@/components/vdash/stat-cards";
import { generateChatReply, SUGGESTED_PROMPTS } from "@/lib/vdash/mock-ai";
import { useVdash } from "@/lib/vdash/store";
import { uid } from "@/lib/vdash/types";
import logo from "@/assets/vdash-logo.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Chat — V-dash Productivity Assistant" },
      {
        name: "description",
        content:
          "Chat with V-dash, your AI workplace productivity assistant, for task planning, research and everyday work support.",
      },
      { property: "og:title", content: "AI Chat — V-dash Productivity Assistant" },
      {
        property: "og:description",
        content: "Ask V-dash for help with tasks, research, drafts and daily planning.",
      },
    ],
  }),
  component: ChatPage,
});

const QUICK_ACTIONS = [
  {
    label: "AI Task Planner",
    description: "Turn a messy list into a prioritised schedule",
    icon: CalendarClock,
    to: "/planner" as const,
  },
  {
    label: "AI Research Assistant",
    description: "Summarise topics, articles and reports",
    icon: Search,
    to: "/research" as const,
  },
];

function ChatPage() {
  const { messages, setMessages, logHistory, resetChat } = useVdash();
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const turn = useRef(0);

  const send = useCallback(
    (text: string) => {
      const content = text.trim();
      if (!content || pending) return;
      setInput("");
      setPending(true);
      setMessages((m) => [
        ...m,
        { id: uid(), role: "user", content, createdAt: Date.now() },
      ]);
      logHistory({ kind: "chat", label: "Chat with V-dash", detail: content });
      const t = turn.current++;
      window.setTimeout(
        () => {
          setMessages((m) => [
            ...m,
            {
              id: uid(),
              role: "assistant",
              content: generateChatReply(content, t),
              createdAt: Date.now(),
            },
          ]);
          setPending(false);
        },
        700 + Math.random() * 600,
      );
    },
    [pending, setMessages, logHistory],
  );

  const regenerate = (id: string) => {
    const idx = messages.findIndex((m) => m.id === id);
    const prompt = [...messages.slice(0, idx)].reverse().find((m) => m.role === "user");
    if (!prompt) return;
    setPending(true);
    const t = turn.current++;
    window.setTimeout(() => {
      setMessages((m) =>
        m.map((msg) =>
          msg.id === id ? { ...msg, content: generateChatReply(prompt.content, t) } : msg,
        ),
      );
      setPending(false);
      toast.success("Response regenerated");
    }, 800);
  };

  const copy = (text: string) => {
    navigator.clipboard?.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-5xl flex-col gap-4 px-4 py-5 sm:px-6 lg:min-h-screen lg:py-7">
      <StatCards />

      <div className="card-surface bg-tiedye animate-rise flex flex-wrap items-center gap-4 p-5">
        <img src={logo} alt="" width={56} height={56} className="h-12 w-12" />
        <div className="min-w-[200px] flex-1">
          <h1 className="text-xl font-bold sm:text-2xl">
            Your AI assistant, <span className="text-brand-gradient">V-dash</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tasks, research, drafts and planning — all in one conversation.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK_ACTIONS.map(({ label, icon: Icon, to }) => (
            <Button key={label} asChild variant="gradient" size="sm">
              <Link to={to}>
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => send("Chat with V-dash about improving my workday")}
          >
            <Sparkle className="h-4 w-4" />
            Chat with V-dash
          </Button>
        </div>
      </div>

      <div className="card-surface flex min-h-[440px] flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span className="h-2 w-2 rounded-full bg-priority-low" />
            V-dash chat
          </div>
          <Button variant="ghost" size="sm" onClick={resetChat}>
            <Trash2 className="h-4 w-4" />
            New chat
          </Button>
        </div>

        <Conversation className="flex-1">
          <ConversationContent className="gap-6 px-4 py-5">
            {messages.map((m) => (
              <Message key={m.id} from={m.role}>
                <div
                  className={
                    m.role === "user"
                      ? "ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground shadow-soft"
                      : "max-w-full"
                  }
                >
                  {m.role === "assistant" && editingId === m.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        className="min-h-40 text-sm"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="gradient"
                          onClick={() => {
                            setMessages((msgs) =>
                              msgs.map((x) => (x.id === m.id ? { ...x, content: draft } : x)),
                            );
                            setEditingId(null);
                            toast.success("Response updated");
                          }}
                        >
                          <Check className="h-4 w-4" />
                          Save
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : m.role === "assistant" ? (
                    <Markdown>{m.content}</Markdown>
                  ) : (
                    m.content
                  )}
                </div>

                {m.role === "assistant" && editingId !== m.id && (
                  <MessageActions>
                    <MessageAction tooltip="Copy" label="Copy" onClick={() => copy(m.content)}>
                      <Copy />
                    </MessageAction>
                    <MessageAction
                      tooltip="Edit response"
                      label="Edit response"
                      onClick={() => {
                        setEditingId(m.id);
                        setDraft(m.content);
                      }}
                    >
                      <Pencil />
                    </MessageAction>
                    {m.id !== "greeting" && (
                      <MessageAction
                        tooltip="Regenerate"
                        label="Regenerate"
                        onClick={() => regenerate(m.id)}
                      >
                        <RefreshCw />
                      </MessageAction>
                    )}
                  </MessageActions>
                )}
              </Message>
            ))}

            {pending && (
              <Message from="assistant">
                <Shimmer>V-dash is thinking…</Shimmer>
              </Message>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <div className="border-t border-border p-3 sm:p-4">
          <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
            {SUGGESTED_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => send(p)}
                className="shrink-0 rounded-full border border-border bg-secondary/60 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                {p}
              </button>
            ))}
          </div>
          <PromptInput
            onSubmit={(_, e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <PromptInputTextarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask V-dash about tasks, research, drafts or planning…"
            />
            <PromptInputFooter className="justify-end">
              <PromptInputSubmit
                {...(pending ? { status: "submitted" as const } : {})}
                disabled={!input.trim() || pending}
              />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>

      <Disclaimer />
    </div>
  );
}
