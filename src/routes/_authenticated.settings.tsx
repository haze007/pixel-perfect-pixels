import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/hooks/use-auth";
import { useTannery } from "@/hooks/use-tannery";
import { useGeminiKey } from "@/hooks/use-gemini-key";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  EyeBoldDuotone,
  EyeClosedBoldDuotone,
  CheckCircleBoldDuotone,
  InfoCircleBoldDuotone,
  LinkCircleBoldDuotone,
  AtomBoldDuotone,
  DownloadMinimalisticBoldDuotone,
} from "solar-icon-set";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [{ title: "Settings — TannerySim" }],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user }   = useAuth();
  const { data: tannery } = useTannery();
  const { key: savedKey, save, saving } = useGeminiKey();

  const fullName = user?.user_metadata?.full_name || user?.email || "User";
  const initials = fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  const [draftKey, setDraftKey]   = useState("");
  const [showKey, setShowKey]     = useState(false);
  const [editing, setEditing]     = useState(false);
  const [seeding, setSeeding]     = useState(false);
  const queryClient = useQueryClient();

  const handleSeedLibrary = async () => {
    setSeeding(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.rpc as any)("seed_community_chemicals");
    setSeeding(false);
    if (error) {
      toast.error(`Seed failed: ${error.message}`);
    } else {
      toast.success(`Community library seeded — ${data ?? 0} new chemicals added`);
      queryClient.invalidateQueries({ queryKey: ["chemicals"] });
    }
  };

  const handleSaveKey = async () => {
    const ok = await save(draftKey);
    if (ok) {
      toast.success("API key saved");
      setEditing(false);
      setDraftKey("");
    } else {
      toast.error("Failed to save API key");
    }
  };

  const handleClearKey = async () => {
    const ok = await save("");
    if (ok) {
      toast.success("API key removed");
      setEditing(false);
      setDraftKey("");
    }
  };

  const keyPresent = !!savedKey;
  const displayKey = keyPresent ? `${savedKey.slice(0, 6)}${"•".repeat(18)}${savedKey.slice(-4)}` : "";

  return (
    <AppShell>
      <div className="p-6 space-y-6 overflow-y-auto h-full max-w-2xl">
        <h1 className="text-xl font-semibold text-foreground">Settings</h1>

        {/* ── Profile ──────────────────────────────────────────── */}
        <Card title="Profile">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-foreground">{fullName}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </Card>

        {/* ── Tannery ──────────────────────────────────────────── */}
        <Card title="Tannery">
          {tannery ? (
            <div className="space-y-2">
              <Row label="Name"    value={tannery.name} />
              <Row label="Slug"    value={tannery.slug} mono />
              <Row label="Created" value={new Date(tannery.created_at).toLocaleDateString()} />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Loading…</p>
          )}
        </Card>

        {/* ── Integrations — Imagen 3 ───────────────────────────── */}
        <Card
          title="AI Preview · Google Imagen 3"
          badge={keyPresent
            ? <StatusBadge ok>Connected</StatusBadge>
            : <StatusBadge ok={false}>Not configured</StatusBadge>}
        >
          <p className="text-xs text-muted-foreground leading-relaxed">
            TannerySim uses{" "}
            <a
              href="https://cloud.google.com/vertex-ai/generative-ai/docs/image/overview"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-0.5"
            >
              Google Imagen 3
              <LinkCircleBoldDuotone size={11} color="currentColor" />
            </a>{" "}
            to generate hyperrealistic swatch previews from your recipe specs. Your API key is
            stored encrypted in your Supabase account — never shared.
          </p>

          {keyPresent && !editing ? (
            <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-1 px-3 py-2.5">
              <CheckCircleBoldDuotone size={16} color="#16A34A" />
              <span className="text-xs font-mono text-foreground flex-1">{displayKey}</span>
              <button
                onClick={() => { setEditing(true); setDraftKey(""); }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Change
              </button>
              <button
                onClick={handleClearKey}
                className="text-xs text-red-500 hover:text-red-700 transition-colors"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type={showKey ? "text" : "password"}
                  placeholder="AIza…"
                  value={draftKey}
                  onChange={(e) => setDraftKey(e.target.value)}
                  className="pr-10 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showKey
                    ? <EyeClosedBoldDuotone size={16} color="currentColor" />
                    : <EyeBoldDuotone size={16} color="currentColor" />}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleSaveKey} disabled={!draftKey.trim() || saving} className="h-8">
                  {saving ? "Saving…" : "Save Key"}
                </Button>
                {editing && (
                  <Button size="sm" variant="ghost" onClick={() => setEditing(false)} className="h-8">
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          )}

          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
          >
            <LinkCircleBoldDuotone size={12} color="currentColor" />
            Get a free Imagen 3 API key at Google AI Studio
          </a>

          <div className="flex gap-2 rounded-lg bg-amber-50 border border-amber-100 px-3 py-2.5 mt-1">
            <InfoCircleBoldDuotone size={14} color="#D97706" className="shrink-0 mt-0.5" />
            <p className="text-[10px] text-amber-800 leading-relaxed">
              Imagen 3 is a paid Google API. Each swatch generation (front + back) uses ~2 image
              credits. Check your Google Cloud billing before generating in bulk.
            </p>
          </div>
        </Card>

        {/* ── Chemical Library ─────────────────────────────────── */}
        <Card
          title="Community Chemical Library"
          badge={<AtomBoldDuotone size={15} color="oklch(0.55 0.18 255)" />}
        >
          <p className="text-xs text-muted-foreground leading-relaxed">
            Seed 150+ real-world tannery chemicals — dyes, fatliquors, syntans, vegetable extracts,
            acids, bases and finishing agents — from suppliers like BASF, Clariant, Lanxess, Stahl
            and TFL. Safe to run multiple times; existing entries are skipped.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 h-8"
            onClick={handleSeedLibrary}
            disabled={seeding}
          >
            <DownloadMinimalisticBoldDuotone size={14} color="currentColor" />
            {seeding ? "Seeding…" : "Seed Community Library"}
          </Button>
        </Card>

        {/* ── Plan ─────────────────────────────────────────────── */}
        <Card title="Plan">
          <div className="flex items-center gap-2">
            <Badge className="bg-primary/20 text-primary">Free Trial</Badge>
            <span className="text-xs text-muted-foreground">Unlimited access during beta</span>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

/* ── Small helpers ───────────────────────────────────────────────────── */

function Card({ title, badge, children }: { title: string; badge?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-surface-1 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold text-foreground flex-1">{title}</h2>
        {badge}
      </div>
      {children}
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm ${mono ? "font-mono text-muted-foreground" : "text-foreground"}`}>{value}</span>
    </div>
  );
}

function StatusBadge({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
        ok ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"
      }`}
    >
      {children}
    </span>
  );
}
