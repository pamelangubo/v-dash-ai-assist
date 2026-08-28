import { uid, type Priority, type Task } from "./types";

const HIGH_WORDS = ["urgent", "asap", "deadline", "today", "client", "board", "critical", "report"];
const LOW_WORDS = ["read", "later", "someday", "browse", "explore", "tidy", "organise", "organize"];

function inferPriority(title: string, index: number): Priority {
  const t = title.toLowerCase();
  if (HIGH_WORDS.some((w) => t.includes(w))) return "high";
  if (LOW_WORDS.some((w) => t.includes(w))) return "low";
  return index < 2 ? "high" : index < 5 ? "medium" : "low";
}

const DAILY_BLOCKS = [
  { block: "08:30 – 09:15", duration: "45 min" },
  { block: "09:30 – 10:45", duration: "75 min" },
  { block: "11:00 – 12:00", duration: "60 min" },
  { block: "13:30 – 14:30", duration: "60 min" },
  { block: "14:45 – 15:30", duration: "45 min" },
  { block: "15:45 – 16:30", duration: "45 min" },
  { block: "16:45 – 17:15", duration: "30 min" },
];

const WEEK_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const NOTES: Record<Priority, string[]> = {
  high: [
    "Protect this slot — deep focus, notifications off.",
    "Do this while your energy peaks; it unblocks other work.",
    "Highest impact item of the day. Ship a first version, refine later.",
  ],
  medium: [
    "Batch with similar work to avoid context switching.",
    "Timebox strictly — stop at the block end and review.",
    "Good candidate for a shared doc so others can review async.",
  ],
  low: [
    "Delegate or defer if the day runs long.",
    "Fits well in a low-energy window after lunch.",
    "Keep to 20 minutes; perfection is not required here.",
  ],
};

const pick = <T,>(arr: T[], i: number) => arr[i % arr.length]!;

export function generatePlan(rawTasks: string[], mode: "daily" | "weekly"): Task[] {
  return rawTasks.map((title, i) => {
    const priority = inferPriority(title, i);
    const slot = pick(DAILY_BLOCKS, i);
    return {
      id: uid(),
      title: title.trim(),
      priority,
      timeBlock: mode === "daily" ? slot.block : pick(DAILY_BLOCKS, i % 4).block,
      duration: slot.duration,
      note: pick(NOTES[priority], i),
      done: false,
      day: mode === "daily" ? "Today" : pick(WEEK_DAYS, Math.floor(i / 2)),
    };
  });
}

export function planSummary(tasks: Task[], mode: "daily" | "weekly") {
  const high = tasks.filter((t) => t.priority === "high").length;
  const medium = tasks.filter((t) => t.priority === "medium").length;
  const low = tasks.filter((t) => t.priority === "low").length;
  return [
    `I've structured ${tasks.length} task${tasks.length === 1 ? "" : "s"} into a ${mode} plan using an urgency × importance review.`,
    `Priority split: ${high} high, ${medium} medium, ${low} low.`,
    "Time optimisation suggestions:",
    "• Front-load the high-priority work before 11:00 while focus is strongest.",
    "• Group medium tasks into one afternoon batch to cut context switching.",
    "• Leave the last 30 minutes of the day for review, replies and tomorrow's setup.",
    low > 0 ? "• Low-priority items are safe to defer or delegate if the day overruns." : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function generateResearch(topic: string, style: "standard" | "simple" | "expanded" = "standard") {
  const subject = topic.trim().split(/\s+/).slice(0, 14).join(" ") || "your topic";
  const short = subject.length > 90 ? subject.slice(0, 90) + "…" : subject;

  if (style === "simple") {
    return `## Simple explanation — ${short}

In plain language: this is about making the work clearer, faster and less error-prone for the people doing it every day.

**The short version**
- There is a problem that costs time or money right now.
- A few practical changes fix most of it.
- The change works best when a small group tries it first.

**Why it matters**
Teams that adopt this typically save a few hours a week per person, and mistakes drop because the process is written down instead of remembered.

**What to do next**
1. Pick one team to try it for four weeks.
2. Measure time saved and errors avoided.
3. Roll out only what actually worked.`;
  }

  const expansion =
    style === "expanded"
      ? `

## Deeper analysis
Adoption tends to follow an S-curve: slow for the first month while habits form, then a sharp rise once one team demonstrates a visible win. The main failure mode is tooling without process — organisations that only buy software see roughly half the benefit of those that also redesign the workflow.

**Risks and counter-arguments**
- Over-automation can hide errors until they become expensive.
- Benefits reported by vendors are usually best-case; discount by 30–40%.
- Change fatigue is real; sequence initiatives rather than stacking them.

**Comparable cases**
- Mid-size professional services firm: 18% reduction in admin hours after 2 quarters.
- Public sector team: gains delayed by 6 months due to procurement, then matched private-sector results.`
      : "";

  return `## Summary — ${short}

Current evidence suggests this area is maturing quickly: the fundamentals are well understood, adoption is uneven, and the biggest gains come from process design rather than tooling alone. Organisations that pair a clear workflow with focused training consistently outperform those that adopt tools in isolation.

## Key insights
1. **Process before tooling.** Documented workflows account for the majority of measured improvement.
2. **Small pilots win.** Teams of 5–12 people produce faster, cleaner signal than org-wide rollouts.
3. **Measurement is the gap.** Most teams cannot say what a change is worth because no baseline was captured.
4. **Quality control matters.** Human review at decision points prevents the small errors that erode trust.

## Important findings
- Time saved concentrates in repetitive, low-judgement work — not in strategic work.
- Benefits plateau after ~3 months unless the workflow is revisited.
- Documentation quality is the single strongest predictor of a successful rollout.

## Recommendations
- Capture a baseline (hours, error rate, cycle time) before changing anything.
- Run a four-week pilot with one willing team and one clear metric.
- Write the process down; treat the tool as replaceable.
- Add a lightweight review step for anything customer-, legal- or finance-facing.
- Review outcomes monthly and retire whatever is not earning its time.${expansion}

## In plain language
This works when you fix the way work flows first, try it small, measure honestly, and keep a human checking anything important.`;
}

const CHAT_FALLBACKS = [
  `Happy to help. Here's how I'd approach it:

1. **Clarify the outcome** — what does "done" look like, and by when?
2. **Break it into blocks** — three or four chunks of 45–75 minutes is usually enough.
3. **Protect the first block** — the highest-impact piece goes before 11:00.

Want me to turn this into a structured plan in the Task Planner?`,
  `Good question. A few practical options:

- **Fastest path:** handle the single highest-impact item today and defer the rest to a batch tomorrow.
- **Most thorough:** map the whole workflow first, then automate the repetitive steps.
- **Lowest risk:** pilot with one team for two weeks and measure before scaling.

Tell me which direction fits and I'll expand it.`,
  `Here's a concise take:

**What matters most**
- Reduce context switching — batch similar work.
- Write decisions down so they don't need re-litigating.
- Keep a human review step on anything customer- or finance-facing.

**Suggested next step**
Give me your task list and I'll prioritise it by urgency and importance.`,
];

export function generateChatReply(prompt: string, turn: number): string {
  const p = prompt.toLowerCase();

  if (/(task|plan|schedule|priorit|todo|to-do|deadline)/.test(p)) {
    return `Let's get your day structured.

**How I'd prioritise**
- **High** — anything with an external deadline or that unblocks other people.
- **Medium** — important but flexible; batch these in one afternoon block.
- **Low** — defer, delegate, or drop if the day runs long.

**A sensible default shape**
- 08:30–10:45 → deep work on the top priority
- 11:00–12:00 → second priority
- 13:30–15:30 → batched medium tasks and meetings
- 16:45–17:15 → review, replies, plan tomorrow

Open the **AI Task Planner** and paste your tasks — I'll build the full daily or weekly schedule with time blocks.`;
  }

  if (/(research|summar|article|report|paper|analy|explain|insight)/.test(p)) {
    return `I can work through that for you.

**What I'll produce**
- A concise summary
- Key insights ranked by importance
- Important findings and caveats
- Concrete recommendations
- A plain-language explanation of anything technical

Paste the topic, article or report into the **AI Research Assistant** and I'll return an editable brief you can copy or save.`;
  }

  if (/(email|write|draft|message|reply)/.test(p)) {
    return `Here's a draft you can adapt:

> Hi [Name],
>
> Thanks for the update. To keep this moving, I've summarised where things stand and what I need next:
>
> • Current status: [one line]
> • Decision needed: [one line]
> • By when: [date]
>
> Happy to jump on a short call if that's quicker.
>
> Best,
> [You]

Want it shorter, warmer, or more formal? Just say the word and I'll regenerate.`;
  }

  if (/(hello|hi\b|hey|good morning|good afternoon)/.test(p)) {
    return `Hello! Good to see you. I can help with **task planning**, **research and summarising**, drafting messages, or thinking through a work problem.

What's on your plate today?`;
  }

  if (/(meeting|agenda|standup|workshop)/.test(p)) {
    return `Here's a tight 30-minute agenda:

| Time | Item | Owner |
| --- | --- | --- |
| 0–5 | Context and desired outcome | Chair |
| 5–15 | Status and blockers | Team |
| 15–25 | Decisions needed | Chair |
| 25–30 | Actions, owners, dates | All |

**Tip:** send the decision list in advance — meetings that start with a decision list finish roughly a third faster.`;
  }

  return pick(CHAT_FALLBACKS, turn);
}

export const SUGGESTED_PROMPTS = [
  "Plan my day around three client deadlines",
  "Summarise this quarterly report for my manager",
  "Help me prioritise a messy backlog",
  "Draft a polite follow-up email to a supplier",
  "Write a 30-minute agenda for a project kickoff",
  "Explain our new expenses policy in plain language",
];

export const DISCLAIMER =
  "V-dash provides AI-generated assistance that may contain errors. Review important information before making business, legal, financial, HR, or other high-impact decisions. Avoid entering confidential or sensitive information.";
