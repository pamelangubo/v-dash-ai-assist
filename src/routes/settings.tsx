import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Disclaimer, PageHeader } from "@/components/vdash/app-shell";
import { DISCLAIMER } from "@/lib/vdash/mock-ai";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — V-dash" },
      {
        name: "description",
        content:
          "Adjust your V-dash workspace preferences: assistant tone, planning defaults and responsible AI reminders.",
      },
      { property: "og:title", content: "Settings — V-dash" },
      { property: "og:description", content: "Workspace and assistant preferences for V-dash." },
    ],
  }),
  component: SettingsPage,
});

function Row({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border py-4 last:border-0">
      <div className="max-w-md">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}

function SettingsPage() {
  const [name, setName] = useState("Alex Morgan");
  const [tone, setTone] = useState("professional");
  const [planning, setPlanning] = useState("daily");
  const [reminders, setReminders] = useState(true);
  const [showDisclaimer, setShowDisclaimer] = useState(true);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 px-4 py-5 sm:px-6 lg:py-7">
      <PageHeader title="Settings" subtitle="Demo preferences — stored locally in your browser." />

      <div className="card-surface px-5 py-1">
        <Row title="Display name" description="Used when V-dash addresses you in chat.">
          <Input value={name} onChange={(e) => setName(e.target.value)} className="w-56" />
        </Row>
        <Row title="Assistant tone" description="How V-dash phrases its responses.">
          <Select value={tone} onValueChange={setTone}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="concise">Concise</SelectItem>
              <SelectItem value="friendly">Friendly</SelectItem>
            </SelectContent>
          </Select>
        </Row>
        <Row title="Default planning mode" description="Which plan type the Task Planner opens with.">
          <Select value={planning} onValueChange={setPlanning}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
            </SelectContent>
          </Select>
        </Row>
        <Row title="Focus reminders" description="Nudge before each scheduled deep-work block.">
          <Switch checked={reminders} onCheckedChange={setReminders} />
        </Row>
        <Row
          title="Responsible AI notice"
          description="Keep the AI accuracy disclaimer visible on every screen."
        >
          <Switch checked={showDisclaimer} onCheckedChange={setShowDisclaimer} />
        </Row>
      </div>

      <div className="card-surface bg-tiedye p-5">
        <h2 className="text-base font-bold">Responsible AI</h2>
        <p className="mt-2 text-sm text-muted-foreground">{DISCLAIMER}</p>
      </div>

      <div>
        <Button variant="gradient" onClick={() => toast.success("Preferences saved")}>
          Save preferences
        </Button>
      </div>

      <Label className="sr-only">Settings</Label>
      <Disclaimer />
    </div>
  );
}
