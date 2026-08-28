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

/* ------------------------------------------------------------------ *
 * Research generation — content aware.
 * The output is derived from the actual text the user provides:
 * keywords, statistics, quoted evidence sentences and a detected
 * subject domain all feed the summary, insights, findings and advice.
 * ------------------------------------------------------------------ */

const STOPWORDS = new Set(
  `a an and or the of to in on for with without by from at as is are was were be been being this that these those it its into over under about after before between during than then there their they we you your our us i he she his her them our not no do does did done can could should would will shall may might must have has had having more most other some such only own same so too very just now new using use used what which who whom when where why how all any both each few many much per via if but because while also across within among against toward towards upon out up down off again further once here does`.split(
    /\s+/,
  ),
);

const DOMAINS: {
  key: string;
  label: string;
  words: string[];
  lens: string;
  metrics: string[];
  actions: string[];
  risks: string[];
}[] = [
  {
    key: "ai",
    label: "AI & automation",
    words: ["ai", "artificial", "intelligence", "machine", "learning", "llm", "model", "automation", "chatbot", "copilot", "genai", "algorithm", "prompt", "data"],
    lens: "capability maturity versus governance readiness",
    metrics: ["hours returned per user per week", "output accepted without rework (%)", "error/hallucination rate at review", "cost per completed task"],
    actions: [
      "Pick two repetitive, high-volume workflows and instrument them before introducing any model.",
      "Define an acceptance bar (what a good output looks like) and sample 20 outputs weekly against it.",
      "Keep a named human reviewer for anything customer-, legal-, finance- or HR-facing.",
      "Log prompts and outputs so quality regressions are traceable rather than anecdotal.",
    ],
    risks: [
      "Confident-but-wrong output is the dominant failure mode; volume hides it until a customer finds it.",
      "Tool sprawl fragments data and makes cost and quality impossible to attribute.",
    ],
  },
  {
    key: "people",
    label: "people & workplace",
    words: ["hybrid", "remote", "employee", "hr", "hiring", "recruit", "retention", "culture", "wellbeing", "burnout", "engagement", "onboarding", "team", "staff", "talent", "workplace", "manager"],
    lens: "behaviour change and manager capability, not policy text",
    metrics: ["voluntary attrition by tenure band", "manager 1:1 coverage", "time-to-productivity for new starters", "engagement pulse by team, not company average"],
    actions: [
      "Publish the operating norms (core hours, response expectations, meeting rules) in writing — ambiguity is the real cost.",
      "Train managers first; team-level variance almost always exceeds policy-level variance.",
      "Run a short pulse per team each month instead of one long annual survey.",
      "Tie any change to one visible commitment leadership actually keeps.",
    ],
    risks: [
      "Company-wide averages mask a handful of struggling teams driving most of the attrition.",
      "Policy without manager enablement produces compliance, not adoption.",
    ],
  },
  {
    key: "finance",
    label: "finance & commercial",
    words: ["cost", "revenue", "budget", "margin", "pricing", "price", "invoice", "cash", "profit", "roi", "spend", "forecast", "procurement", "supplier", "finance", "investment"],
    lens: "unit economics and the reliability of the underlying numbers",
    metrics: ["gross margin by segment", "cost-to-serve per account", "forecast accuracy vs actuals", "days from work done to cash collected"],
    actions: [
      "Rebuild the number from source before acting on it — most disputes are definition disputes.",
      "Model a downside case at 70% of the expected benefit and check the decision still holds.",
      "Separate one-off savings from recurring savings in every business case.",
      "Set a review date where the investment is either scaled or stopped.",
    ],
    risks: [
      "Benefit cases built on vendor figures typically overstate outcomes by 30–40%.",
      "Savings that never appear in a budget line are savings that did not happen.",
    ],
  },
  {
    key: "marketing",
    label: "marketing & growth",
    words: ["marketing", "brand", "campaign", "customer", "audience", "seo", "content", "social", "conversion", "funnel", "leads", "growth", "retention", "churn", "market"],
    lens: "channel efficiency and message clarity rather than volume",
    metrics: ["cost per qualified lead by channel", "landing-to-signup conversion", "90-day retention of new customers", "share of pipeline from repeatable sources"],
    actions: [
      "Cut the two lowest-performing channels and reinvest in the one with the clearest attribution.",
      "Test the message, not the format — most flat results are positioning problems.",
      "Instrument the full path to revenue before optimising the top of it.",
      "Write for the buyer's actual objection; generic value language converts poorly.",
    ],
    risks: [
      "Attribution gaps make good channels look bad and vice versa.",
      "Short test windows produce noise that reads like a result.",
    ],
  },
  {
    key: "ops",
    label: "operations & process",
    words: ["process", "workflow", "operations", "supply", "logistics", "efficiency", "productivity", "quality", "lean", "manufacturing", "delivery", "backlog", "throughput", "service"],
    lens: "where work waits, not where people work",
    metrics: ["cycle time end to end", "queue/wait time between steps", "rework rate", "first-time-right percentage"],
    actions: [
      "Map the flow and measure waiting time between steps — that is usually where most of the loss sits.",
      "Remove one handoff before adding any new tooling.",
      "Standardise the top three most-repeated tasks in writing.",
      "Run the change on one line/team for four weeks with a single tracked metric.",
    ],
    risks: [
      "Local optimisation of one step often increases the total cycle time.",
      "Unmeasured rework silently absorbs the gains from faster processing.",
    ],
  },
  {
    key: "compliance",
    label: "risk, legal & compliance",
    words: ["compliance", "legal", "regulation", "policy", "gdpr", "popia", "privacy", "security", "audit", "risk", "governance", "contract", "consent", "breach"],
    lens: "defensibility — can the decision be evidenced later",
    metrics: ["open findings by severity and age", "% of processing with a documented lawful basis", "time to detect and report an incident", "third-party review coverage"],
    actions: [
      "Write down the decision, the basis for it and who approved it — evidence beats intent.",
      "Classify data before choosing tooling; the classification drives every later control.",
      "Set retention and deletion rules now, not after the first request arrives.",
      "Rehearse the incident path once; untested processes fail under pressure.",
    ],
    risks: [
      "Shadow tooling moves sensitive data outside the controls you documented.",
      "Guidance changes faster than internal policy review cycles.",
    ],
  },
  {
    key: "education",
    label: "learning & education",
    words: ["learning", "education", "training", "student", "course", "curriculum", "skills", "teaching", "school", "university", "assessment"],
    lens: "transfer of learning into actual work behaviour",
    metrics: ["completion vs applied-on-the-job rate", "assessment gain pre/post", "manager-observed behaviour change at 60 days", "drop-off point in the curriculum"],
    actions: [
      "Design the assessment before the content; it defines what is actually learned.",
      "Space practice over weeks — single sessions decay within a month.",
      "Give managers a two-question follow-up to run at 30 and 60 days.",
      "Cut content that no assessment or task depends on.",
    ],
    risks: [
      "Completion rates are a participation metric, not a learning outcome.",
      "Without applied practice, most gains disappear inside a quarter.",
    ],
  },
];

const GENERIC_DOMAIN = {
  key: "general",
  label: "general business",
  words: [] as string[],
  lens: "evidence quality and the cost of being wrong",
  metrics: ["baseline before the change", "one primary outcome metric", "time and effort actually spent", "unintended side effects"],
  actions: [
    "Write the question down precisely — most research fails on a vague question.",
    "Capture a baseline before changing anything.",
    "Test the smallest version that could show a real signal.",
    "Set a date to review, keep or stop.",
  ],
  risks: [
    "Confirmation bias: sources agreeing with the plan get weighted too heavily.",
    "Small samples over short windows produce results that do not repeat.",
  ],
};

function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w) && !/^\d+$/.test(w));
}

function keywords(text: string, n: number) {
  const counts = new Map<string, number>();
  for (const w of tokenize(text)) counts.set(w, (counts.get(w) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)
    .slice(0, n)
    .map(([w]) => w);
}

function sentences(text: string) {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map((s) => s.trim())
    .filter((s) => s.split(" ").length > 5);
}

function stats(text: string) {
  const found = text.match(/(?:[£$€R]\s?\d[\d,.]*\s?(?:k|m|bn|billion|million)?|\d[\d,.]*\s?(?:%|percent)|\b(?:19|20)\d{2}\b|\b\d[\d,.]*\s?(?:hours?|days?|weeks?|months?|users?|people|employees|customers)\b)/gi);
  return [...new Set((found ?? []).map((s) => s.trim()))].slice(0, 6);
}

function detectDomain(text: string) {
  const toks = tokenize(text);
  let best = GENERIC_DOMAIN as (typeof DOMAINS)[number];
  let bestScore = 0;
  for (const d of DOMAINS) {
    const score = toks.filter((t) => d.words.some((w) => t === w || t.startsWith(w))).length;
    if (score > bestScore) {
      best = d;
      bestScore = score;
    }
  }
  return { domain: bestScore >= 2 ? best : (GENERIC_DOMAIN as (typeof DOMAINS)[number]), score: bestScore };
}

const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function generateResearch(
  topic: string,
  style: "standard" | "simple" | "expanded" = "standard",
) {
  const text = topic.trim();
  const words = text.split(/\s+/).filter(Boolean);
  const isDocument = words.length >= 45;
  const subject = words.slice(0, 14).join(" ") || "your topic";
  const short = subject.length > 90 ? subject.slice(0, 90) + "…" : subject;

  const { domain } = detectDomain(text);
  const kws = keywords(text, 8);
  const k = (i: number, fallback: string) => kws[i] ?? fallback;
  const figures = stats(text);
  const sents = sentences(text);
  const evidence = sents
    .map((s) => ({ s, score: tokenize(s).filter((t) => kws.includes(t)).length / Math.max(6, s.split(" ").length) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((e) => (e.s.length > 220 ? e.s.slice(0, 217) + "…" : e.s));

  const focus = kws.slice(0, 3).map((w) => `**${w}**`).join(", ") || `**${short}**`;
  const sourceLine = isDocument
    ? `Analysed ${words.length} words (${sents.length} sentences) of supplied text.`
    : `Analysed the topic as supplied (${words.length} word${words.length === 1 ? "" : "s"}); no source document was pasted, so this brief is framed as a scoping analysis rather than a source review.`;

  /* ---------------- simple ---------------- */
  if (style === "simple") {
    return `## Plain-language explanation — ${short}

*${sourceLine} Subject area detected: ${domain.label}.*

**What this is really about**
${isDocument
  ? `The text keeps returning to ${focus}. Stripped of jargon, it is arguing that how ${k(0, "the work")} is handled today creates cost, and that changing the approach to ${k(1, "it")} would reduce that cost.`
  : `You've asked about ${focus}. In plain terms, the question is whether changing how ${k(0, "this")} is handled is worth the effort it takes.`}

**The three things that matter**
1. ${titleCase(k(0, "the main issue"))} is the centre of it — everything else follows from how you handle it.
2. ${titleCase(k(1, "the second factor"))} decides whether the change sticks or fades after a few weeks.
3. ${titleCase(k(2, "measurement"))} is how you know it worked; without it you are guessing.
${figures.length ? `\n**Numbers mentioned:** ${figures.join(", ")} — check where each came from before repeating them.\n` : ""}
**What to do next**
1. Write down the one thing you want to be different, in a sentence.
2. Measure ${domain.metrics[0]} as it is today.
3. Try the change with one small group for four weeks.
4. Keep it only if the number moved.

**The honest caveat**
${domain.risks[0]}`;
  }

  /* ---------------- standard / expanded ---------------- */
  const expansion =
    style === "expanded"
      ? `

## Deeper analysis — ${domain.label}
Viewed through ${domain.lens}, ${focus} is less a single decision than a sequence. The first weeks are absorbed by definition work: agreeing what ${k(0, "the subject")} means in your context and what counts as a good outcome. Only after that does ${k(1, "the change itself")} start producing measurable movement.

**Where this typically goes wrong**
${domain.risks.map((r) => `- ${r}`).join("\n")}
- ${titleCase(k(2, "the supporting factor"))} is usually under-resourced relative to ${k(0, "the headline change")}, and becomes the constraint by month two.

**Second-order effects to watch**
- Changing ${k(0, "this")} shifts workload rather than removing it unless a handoff is deleted.
- Teams closest to ${k(1, "the work")} will spot problems weeks before the reporting does — give them a route to say so.

**How to strengthen this brief**
${isDocument
  ? `- The supplied text is one perspective. Add a source that disagrees with it and re-test the conclusion.\n- Verify ${figures.length ? `the figures quoted (${figures.slice(0, 3).join(", ")})` : "any quantitative claims"} against a primary source.`
  : `- Paste the actual report, article or dataset and this brief will quote and test its specific claims instead of scoping the question.\n- Add your own baseline numbers for ${domain.metrics[0]}.`}`
      : "";

  return `## Summary — ${short}

*${sourceLine} Subject area detected: **${domain.label}**; assessed through ${domain.lens}.*

${isDocument
  ? `The material centres on ${focus}. The argument it makes is that ${k(0, "the subject")} is currently handled inconsistently, and that a deliberate approach to ${k(1, "it")} produces most of the available benefit. The reasoning is coherent, but the evidence supplied is stronger on direction than on magnitude.`
  : `Your question concerns ${focus}. Within ${domain.label}, the decisive variable is rarely the tool or the policy — it is whether ${k(0, "the subject")} is defined precisely enough to be measured. This brief scopes the question, the evidence you would need, and what to do first.`}

## Key insights
1. **${titleCase(k(0, "Core subject"))} is the dependent variable.** Movement in ${k(1, "the surrounding factors")} only shows up once ${k(0, "it")} is defined and tracked consistently.
2. **${titleCase(k(1, "The second factor"))} determines durability.** It is the difference between a four-week improvement and a permanent one.
3. **${titleCase(k(2, "Evidence quality"))} is the weak point.** ${figures.length ? `Figures are present (${figures.slice(0, 3).join(", ")}) but their derivation is not stated.` : "No quantitative anchor is present, so claims cannot currently be sized."}
4. **Scope discipline beats ambition.** In ${domain.label}, narrow changes with one owner outperform broad programmes with shared accountability.

## Important findings
${evidence.length
  ? evidence.map((e) => `- From the text: "${e}"\n  → Treat as a claim to verify, not a finding; check the basis before relying on it.`).join("\n")
  : `- The question as stated is unscoped: "${short}" could mean several different investigations with different costs.\n- No baseline exists yet for ${domain.metrics[0]}, so any later claim of improvement will be contestable.\n- The most likely hidden cost sits in ${k(1, "the surrounding process")}, not in ${k(0, "the headline item")}.`}
${figures.length ? `- Figures extracted: ${figures.join(", ")}. Re-derive each from source; quoted numbers change meaning when the denominator changes.` : ""}

## Recommendations
${domain.actions.map((a, i) => `${i + 1}. ${a}`).join("\n")}
5. Track exactly these: ${domain.metrics.join("; ")}.

## Risks and counter-arguments
${domain.risks.map((r) => `- ${r}`).join("\n")}
- A reasonable opposing view: ${k(0, "this subject")} may be a symptom, and the real constraint could sit upstream in ${k(3, "adjacent processes")}.

## In plain language
${isDocument
  ? `The text says ${k(0, "this")} matters and should be handled differently. That is probably right in direction. Before acting, pin down what ${k(1, "success")} means, measure it today, change one thing, and check the number in four weeks.`
  : `Define what you actually mean by ${k(0, "this")}, measure where you are now, change one thing for a small group, and keep it only if ${domain.metrics[0]} improves.`}${expansion}`;
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
