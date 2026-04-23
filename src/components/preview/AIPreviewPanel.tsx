/**
 * AIPreviewPanel — versioned Imagen 3 swatch preview feed.
 *
 * Layout:
 *   ┌─────────────────────────────────┐
 *   │  [+ New Snapshot]               │  ← recipe-changed banner
 *   ├─────────────────────────────────┤
 *   │  Version 2  ·  pH 4.2 · Chrome  │
 *   │  ┌──────┐  ┌──────┐            │  ← horizontal carousel
 *   │  │ Front│  │ Back │            │
 *   │  └──────┘  └──────┘            │
 *   │  [Generate ↑]                   │
 *   ├── ── ── ── ── ── ── ── ── ── ──┤  ← subtle divider
 *   │  Version 1  ·  ...              │
 *   └─────────────────────────────────┘
 */

import { useState, useRef, useEffect, useCallback } from "react";
import {
  buildLeatherPrompt,
  generateSwatchImage,
  type PromptState,
} from "@/lib/gemini-preview";
import { useGeminiKey } from "@/hooks/use-gemini-key";
import { estimateDyeUptake, type ProcessConditions } from "@/lib/process-conditions";
import { labToHex } from "@/lib/lab-to-rgb";
import type { RecipeStep } from "@/components/recipe/RecipeStepEditor";
import {
  AddCircleBoldDuotone,
  GalleryAddBoldDuotone,
  RefreshBoldDuotone,
  SettingsBoldDuotone,
  InfoCircleBoldDuotone,
} from "solar-icon-set";
import { Link } from "@tanstack/react-router";

/* ── Types ───────────────────────────────────────────────────────────── */

export interface PreviewVariant {
  id: string;
  type: "swatch-front" | "swatch-back";
  imageDataUrl: string | null;
  prompt: string;
  generating: boolean;
  error: string | null;
}

export interface PreviewVersion {
  id: string;
  timestamp: number;
  label: string;
  predictedLab: { l: number; a: number; b: number };
  variants: PreviewVariant[];
  recipeSnapshot: string; // JSON fingerprint for change detection
}

interface Props {
  predictedLab: { l: number; a: number; b: number };
  steps: RecipeStep[];
  conditions: ProcessConditions;
  substrateName?: string;
}

/* ── Helpers ─────────────────────────────────────────────────────────── */

function makeFingerprint(predictedLab: Props["predictedLab"], conditions: ProcessConditions, steps: RecipeStep[]) {
  return JSON.stringify({
    l: predictedLab.l.toFixed(1),
    a: predictedLab.a.toFixed(1),
    b: predictedLab.b.toFixed(1),
    ph: conditions.pH,
    temp: conditions.temperature_c,
    float: conditions.float_ratio,
    tanning: conditions.tanning_type,
    origin: conditions.substrate_origin,
    steps: steps.map((s) => `${s.chemical_id}:${s.percentage}`).join(","),
  });
}

function makeLabel(conditions: ProcessConditions, predictedLab: Props["predictedLab"]): string {
  const parts = [
    `pH ${conditions.pH.toFixed(1)}`,
    conditions.tanning_type.replace("_", "-"),
    conditions.substrate_origin.replace(/_/g, " "),
    `L*${predictedLab.l.toFixed(0)}`,
  ];
  return parts.join(" · ");
}

function makeVariants(): PreviewVariant[] {
  return [
    { id: crypto.randomUUID(), type: "swatch-front", imageDataUrl: null, prompt: "", generating: false, error: null },
    { id: crypto.randomUUID(), type: "swatch-back",  imageDataUrl: null, prompt: "", generating: false, error: null },
  ];
}

/* ── Single variant thumbnail ────────────────────────────────────────── */

function VariantThumb({ variant }: { variant: PreviewVariant }) {
  const label = variant.type === "swatch-front" ? "Front · Grain" : "Back · Flesh";

  return (
    <div className="shrink-0 w-[180px] h-[180px] rounded-xl overflow-hidden border border-border bg-surface-1 relative select-none">
      {variant.generating ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-[10px] text-muted-foreground">Generating…</p>
        </div>
      ) : variant.imageDataUrl ? (
        <>
          <img
            src={variant.imageDataUrl}
            alt={label}
            className="w-full h-full object-cover"
            draggable={false}
          />
          {/* overlay label */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/50 to-transparent px-2 py-1.5">
            <p className="text-[9px] text-white/90 font-medium">{label}</p>
          </div>
        </>
      ) : variant.error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 px-3 text-center">
          <InfoCircleBoldDuotone size={18} color="#DC2626" />
          <p className="text-[10px] text-red-600 leading-snug">{variant.error}</p>
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <GalleryAddBoldDuotone size={22} color="oklch(0.32 0.09 255 / 0.3)" />
          <p className="text-[10px] text-muted-foreground/60">{label}</p>
        </div>
      )}
    </div>
  );
}

/* ── Version card ────────────────────────────────────────────────────── */

function VersionCard({
  version,
  geminiKey,
  promptState,
  onUpdate,
  isLatest,
}: {
  version: PreviewVersion;
  geminiKey: string;
  promptState: PromptState;
  onUpdate: (id: string, updater: (v: PreviewVersion) => PreviewVersion) => void;
  isLatest: boolean;
}) {
  const hexColor = labToHex(version.predictedLab.l, version.predictedLab.a, version.predictedLab.b);
  const isGenerating = version.variants.some((v) => v.generating);
  const hasImages    = version.variants.some((v) => v.imageDataUrl);

  const generate = useCallback(async () => {
    if (!geminiKey) return;

    // Mark all variants as generating
    onUpdate(version.id, (v) => ({
      ...v,
      variants: v.variants.map((vv) => ({ ...vv, generating: true, error: null })),
    }));

    // Generate each variant sequentially (saves quota vs parallel)
    for (const variant of version.variants) {
      const prompt = buildLeatherPrompt(
        { ...promptState, predictedLab: version.predictedLab },
        variant.type,
      );
      try {
        const result = await generateSwatchImage(geminiKey, prompt);
        onUpdate(version.id, (v) => ({
          ...v,
          variants: v.variants.map((vv) =>
            vv.id === variant.id
              ? { ...vv, generating: false, imageDataUrl: result.imageDataUrl, prompt: result.prompt }
              : vv,
          ),
        }));
      } catch (err: any) {
        onUpdate(version.id, (v) => ({
          ...v,
          variants: v.variants.map((vv) =>
            vv.id === variant.id
              ? { ...vv, generating: false, error: err.message ?? "Generation failed" }
              : vv,
          ),
        }));
      }
    }
  }, [geminiKey, version.id, version.predictedLab, promptState, onUpdate]);

  const timeStr = new Date(version.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex items-center gap-2 px-4">
        <div className="h-4 w-4 rounded-sm border border-black/10 shrink-0" style={{ backgroundColor: hexColor }} />
        <p className="text-xs font-medium text-foreground flex-1 truncate">{version.label}</p>
        <span className="text-[10px] text-muted-foreground shrink-0">{timeStr}</span>
        {hasImages && !isGenerating && (
          <button
            onClick={generate}
            className="text-[10px] text-muted-foreground hover:text-primary transition-colors"
            title="Regenerate"
          >
            <RefreshBoldDuotone size={13} color="currentColor" />
          </button>
        )}
      </div>

      {/* Horizontal carousel */}
      <div
        className="flex gap-3 px-4 overflow-x-auto pb-1"
        style={{ scrollbarWidth: "none" } as React.CSSProperties}
      >
        {version.variants.map((variant) => (
          <VariantThumb key={variant.id} variant={variant} />
        ))}
      </div>

      {/* Generate button */}
      {!hasImages && !isGenerating && (
        <div className="px-4">
          {geminiKey ? (
            <button
              onClick={generate}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary text-xs font-medium py-2.5 transition-colors"
            >
              <GalleryAddBoldDuotone size={15} color="currentColor" />
              Generate swatch preview
            </button>
          ) : (
            <Link to="/settings">
              <button className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-surface-1 hover:bg-surface-2 text-muted-foreground text-xs py-2.5 transition-colors">
                <SettingsBoldDuotone size={14} color="currentColor" />
                Add Imagen 3 API key in Settings to generate
              </button>
            </Link>
          )}
        </div>
      )}

      {isGenerating && (
        <div className="px-4">
          <div className="w-full rounded-xl bg-primary/5 border border-primary/20 py-2.5 text-center">
            <p className="text-xs text-primary font-medium">Generating hyperrealistic swatch…</p>
            <p className="text-[10px] text-primary/60 mt-0.5">Imagen 3 · takes ~10–20 s</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main panel ──────────────────────────────────────────────────────── */

export function AIPreviewPanel({ predictedLab, steps, conditions, substrateName }: Props) {
  const { key: geminiKey } = useGeminiKey();
  const [versions, setVersions] = useState<PreviewVersion[]>([]);
  const prevFingerprintRef = useRef<string>("");
  const [recipeChanged, setRecipeChanged] = useState(false);

  const currentFingerprint = makeFingerprint(predictedLab, conditions, steps);

  // Detect recipe changes after at least one snapshot exists
  useEffect(() => {
    if (versions.length === 0) return;
    if (currentFingerprint !== prevFingerprintRef.current) {
      setRecipeChanged(true);
    }
  }, [currentFingerprint, versions.length]);

  const addSnapshot = useCallback(() => {
    const newVersion: PreviewVersion = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      label: makeLabel(conditions, predictedLab),
      predictedLab: { ...predictedLab },
      variants: makeVariants(),
      recipeSnapshot: currentFingerprint,
    };
    setVersions((prev) => [newVersion, ...prev]);
    prevFingerprintRef.current = currentFingerprint;
    setRecipeChanged(false);
  }, [conditions, predictedLab, currentFingerprint]);

  const updateVersion = useCallback(
    (id: string, updater: (v: PreviewVersion) => PreviewVersion) => {
      setVersions((prev) => prev.map((v) => (v.id === id ? updater(v) : v)));
    },
    [],
  );

  const promptState: PromptState = {
    predictedLab,
    conditions,
    steps,
    uptakeFactor: estimateDyeUptake(conditions),
    substrateName,
  };

  const uptake = estimateDyeUptake(conditions);
  const uptakePct = Math.round(uptake * 100);
  const hexColor  = labToHex(predictedLab.l, predictedLab.a, predictedLab.b);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-surface-1/30">
      {/* ── Top bar ─────────────────────────────────────────────── */}
      <div className="shrink-0 border-b border-border px-4 py-3 flex flex-col gap-2">
        {/* Predicted colour + uptake */}
        <div className="flex items-center gap-3">
          <div
            className="h-8 w-8 rounded-lg border border-black/10 shrink-0 shadow-sm"
            style={{ backgroundColor: hexColor }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">Predicted Colour</p>
            <p className="text-[10px] font-mono text-muted-foreground">
              L*{predictedLab.l.toFixed(1)} a*{predictedLab.a.toFixed(1)} b*{predictedLab.b.toFixed(1)}
              <span className="ml-2">{hexColor}</span>
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] text-muted-foreground">Dye uptake</p>
            <p
              className="text-xs font-bold"
              style={{ color: uptakePct >= 70 ? "#16A34A" : uptakePct >= 40 ? "#D97706" : "#DC2626" }}
            >
              {uptakePct}%
            </p>
          </div>
        </div>

        {/* Recipe changed banner */}
        {recipeChanged && (
          <button
            onClick={addSnapshot}
            className="w-full flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-left hover:bg-amber-100 transition-colors animate-fade-in"
          >
            <InfoCircleBoldDuotone size={14} color="#D97706" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-amber-800">Recipe changed</p>
              <p className="text-[9px] text-amber-700">Tap to add a new snapshot for the current settings</p>
            </div>
          </button>
        )}

        {/* New snapshot button */}
        {!recipeChanged && (
          <button
            onClick={addSnapshot}
            className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-border hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-primary text-xs py-1.5 transition-colors"
          >
            <AddCircleBoldDuotone size={13} color="currentColor" />
            New snapshot
          </button>
        )}
      </div>

      {/* ── Version feed ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {versions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 px-6 text-center">
            <div className="h-16 w-16 rounded-2xl bg-surface-2 flex items-center justify-center">
              <GalleryAddBoldDuotone size={28} color="oklch(0.32 0.09 255 / 0.4)" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground mb-1">No previews yet</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Hit <strong>New snapshot</strong> above to lock in the current recipe settings,
                then generate a hyperrealistic Imagen 3 swatch.
              </p>
            </div>
          </div>
        ) : (
          <div className="py-4 space-y-0">
            {versions.map((version, i) => (
              <div key={version.id}>
                <VersionCard
                  version={version}
                  geminiKey={geminiKey}
                  promptState={promptState}
                  onUpdate={updateVersion}
                  isLatest={i === 0}
                />
                {i < versions.length - 1 && (
                  <div className="mx-4 my-4 border-t border-dashed border-border/60" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
