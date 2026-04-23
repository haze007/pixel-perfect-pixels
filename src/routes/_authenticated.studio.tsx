import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { AIPreviewPanel } from "@/components/preview/AIPreviewPanel";
import { RecipeStepEditor, type RecipeStep } from "@/components/recipe/RecipeStepEditor";
import { RecipePredictionPanel } from "@/components/recipe/RecipePredictionPanel";
import { ProcessConditionsPanel } from "@/components/recipe/ProcessConditionsPanel";
import { QualityTargetsPanel, defaultQualityTargets, type QualityTargets } from "@/components/recipe/QualityTargetsPanel";
import { SpecSheet } from "@/components/recipe/SpecSheet";
import { useState, useMemo, useEffect } from "react";
import { useChemicals } from "@/hooks/use-chemicals";
import { useSubstrates } from "@/hooks/use-substrates";
import { useCreateRecipe, useUpdateRecipe, useRecipe } from "@/hooks/use-recipes";
import { useTanneryId } from "@/hooks/use-tannery";
import { predictRecipeLab, deltaE76 } from "@/lib/color-science";
import { estimateDyeUptake, DEFAULT_CONDITIONS, type ProcessConditions } from "@/lib/process-conditions";
import { labToHex } from "@/lib/lab-to-rgb";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  DisketteBoldDuotone,
  SidebarMinimalisticBoldDuotone,
  AtomBoldDuotone,
  DocumentBoldDuotone,
  TestTubeBoldDuotone,
  CheckCircleBoldDuotone,
  PaletteRoundBoldDuotone,
  MagniferBoldDuotone,
  AddCircleBoldDuotone,
} from "solar-icon-set";
import { toast } from "sonner";
import type { Chemical } from "@/hooks/use-chemicals";

export const Route = createFileRoute("/_authenticated/studio")({
  validateSearch: (search: Record<string, unknown>) => ({
    mode: search.mode as "new" | "edit" | undefined,
    id: search.id as string | undefined,
  }),
  beforeLoad: ({ search }) => {
    if (!search.mode && !search.id) throw redirect({ to: "/recipes" });
  },
  head: () => ({
    meta: [
      { title: "Recipe Studio — TannerySim" },
      { name: "description", content: "Leather recipe studio with AI swatch preview" },
    ],
  }),
  component: StudioPage,
});

/* ── Category colours for the chemical sheet ─────────────────────── */
const CAT_META: Record<string, { label: string; color: string; bg: string }> = {
  dye:             { label: "Dye",           color: "#7C3AED", bg: "#F5F3FF" },
  fatliquor:       { label: "Fatliquor",     color: "#D97706", bg: "#FFFBEB" },
  retanning_agent: { label: "Retan",         color: "#16A34A", bg: "#F0FDF4" },
  surfactant:      { label: "Surfactant",    color: "#0891B2", bg: "#ECFEFF" },
  acid:            { label: "Acid",          color: "#DC2626", bg: "#FEF2F2" },
  base:            { label: "Base",          color: "#2563EB", bg: "#EFF6FF" },
  fixing_agent:    { label: "Fixing Agent",  color: "#059669", bg: "#ECFDF5" },
  other:           { label: "Other",         color: "#6B7280", bg: "#F4F4F5" },
};

/* ── Chemicals quick-access sheet ────────────────────────────────── */

function ChemicalsSheet({
  open,
  onClose,
  chemicals,
  onAddToRecipe,
}: {
  open: boolean;
  onClose: () => void;
  chemicals: Chemical[];
  onAddToRecipe: (chem: Chemical) => void;
}) {
  const [query, setQuery]         = useState("");
  const [activeCat, setActiveCat] = useState<string>("all");

  const categories = useMemo(() => {
    const cats = new Set(chemicals.map((c) => c.category));
    return ["all", ...Array.from(cats).sort()];
  }, [chemicals]);

  const filtered = useMemo(() => {
    let list = chemicals;
    if (activeCat !== "all") list = list.filter((c) => c.category === activeCat);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q) || (c.supplier ?? "").toLowerCase().includes(q));
    }
    return list;
  }, [chemicals, activeCat, query]);

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="left" className="w-80 p-0 flex flex-col">
        <SheetHeader className="px-4 pt-4 pb-3 border-b border-border shrink-0">
          <SheetTitle className="text-sm flex items-center gap-2">
            <AtomBoldDuotone size={16} color="oklch(0.32 0.09 255)" />
            Chemical Library
          </SheetTitle>
          {/* Search */}
          <div className="relative mt-2">
            <MagniferBoldDuotone size={14} color="currentColor" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="w-full h-8 pl-8 pr-3 rounded-lg border border-border bg-surface-1 text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </SheetHeader>

        {/* Category tabs */}
        <div className="flex gap-1.5 px-3 py-2 overflow-x-auto shrink-0 border-b border-border" style={{ scrollbarWidth: "none" } as React.CSSProperties}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors ${
                activeCat === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-2 text-muted-foreground hover:bg-surface-3"
              }`}
            >
              {cat === "all" ? "All" : (CAT_META[cat]?.label ?? cat)}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <p className="text-sm font-medium text-foreground mb-1">No chemicals found</p>
              <p className="text-xs text-muted-foreground mb-4">
                {chemicals.length === 0
                  ? "The community library hasn't been seeded yet. Apply the DB migration or add chemicals in the Catalogue."
                  : "Try a different search or category."}
              </p>
              {chemicals.length === 0 && (
                <Link to="/catalogue" onClick={onClose}>
                  <button className="text-xs rounded-lg bg-primary px-3 py-1.5 text-primary-foreground">
                    Go to Catalogue
                  </button>
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((chem) => {
                const meta   = CAT_META[chem.category] ?? CAT_META.other;
                const hasLab = chem.lab_l != null;
                const hex    = hasLab ? labToHex(chem.lab_l!, chem.lab_a!, chem.lab_b!) : null;
                return (
                  <div key={chem.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface-1 group">
                    {/* Colour chip */}
                    <div
                      className="h-8 w-8 shrink-0 rounded-md border border-black/10"
                      style={{ backgroundColor: hex ?? meta.bg }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{chem.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                          style={{ backgroundColor: meta.bg, color: meta.color }}
                        >
                          {meta.label}
                        </span>
                        {chem.supplier && (
                          <span className="text-[9px] text-muted-foreground truncate">{chem.supplier}</span>
                        )}
                        {chem.is_community && (
                          <span className="text-[9px] text-muted-foreground/60">· Community</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => { onAddToRecipe(chem); onClose(); }}
                      className="shrink-0 h-7 w-7 rounded-lg border border-border bg-background flex items-center justify-center opacity-0 group-hover:opacity-100 hover:border-primary hover:bg-primary/10 transition-all"
                      title="Add to recipe"
                    >
                      <AddCircleBoldDuotone size={14} color="oklch(0.32 0.09 255)" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ── Studio page ─────────────────────────────────────────────────── */

function StudioPage() {
  const { mode, id } = Route.useSearch();
  const { data: chemicals = [] } = useChemicals();
  const { data: substrates = [] } = useSubstrates();
  const { data: tanneryId } = useTanneryId();
  const createRecipe = useCreateRecipe();
  const updateRecipe = useUpdateRecipe();
  const { data: existingRecipe, isLoading: recipeLoading } = useRecipe(mode === "edit" ? id : undefined);

  const [stepsOpen, setStepsOpen]           = useState(true);
  const [chemSheetOpen, setChemSheetOpen]   = useState(false);
  const [recipeName, setRecipeName]         = useState("Untitled Recipe");
  const [substrateId, setSubstrateId]       = useState<string>("");
  const [steps, setSteps]                   = useState<RecipeStep[]>([]);
  const [targetLab, setTargetLab]           = useState<{ l: number; a: number; b: number }>({ l: 40, a: 15, b: 10 });
  const [showTarget, setShowTarget]         = useState(false);
  const [conditions, setConditions]         = useState<ProcessConditions>(DEFAULT_CONDITIONS);
  const [qualityTargets, setQualityTargets] = useState<QualityTargets>(defaultQualityTargets);
  const [rightTab, setRightTab]             = useState<"colour" | "conditions" | "quality">("colour");
  const [showSpecSheet, setShowSpecSheet]   = useState(false);

  useEffect(() => {
    if (!existingRecipe) return;
    setRecipeName(existingRecipe.name);
    setSubstrateId(existingRecipe.substrate_id ?? "");
    setSteps(Array.isArray(existingRecipe.steps) ? (existingRecipe.steps as unknown as RecipeStep[]) : []);
    if (existingRecipe.target_lab_l != null) {
      setTargetLab({ l: existingRecipe.target_lab_l, a: existingRecipe.target_lab_a ?? 0, b: existingRecipe.target_lab_b ?? 0 });
      setShowTarget(true);
    }
  }, [existingRecipe]);

  const substrate = substrates.find((s) => s.id === substrateId) ?? substrates[0];
  const baseLab   = substrate
    ? { l: substrate.base_lab_l, a: substrate.base_lab_a, b: substrate.base_lab_b }
    : { l: 70, a: 0, b: 10 };

  const stepsWithLab = useMemo(() =>
    steps.map((s) => {
      const chem = chemicals.find((c) => c.id === s.chemical_id);
      return { ...s, lab_l: chem?.lab_l ?? null, lab_a: chem?.lab_a ?? null, lab_b: chem?.lab_b ?? null };
    }),
    [steps, chemicals],
  );

  const uptakeFactor = useMemo(() => estimateDyeUptake(conditions), [conditions]);
  const predictedLab = useMemo(
    () => predictRecipeLab(stepsWithLab, baseLab, uptakeFactor),
    [stepsWithLab, baseLab, uptakeFactor],
  );

  const handleSave = () => {
    if (!tanneryId) { toast.error("No tannery — sign out and back in"); return; }
    const dE = showTarget
      ? deltaE76(targetLab.l, targetLab.a, targetLab.b, predictedLab.l, predictedLab.a, predictedLab.b)
      : null;
    const payload = {
      name: recipeName, tannery_id: tanneryId, substrate_id: substrateId || null,
      steps: steps as any,
      target_lab_l: showTarget ? targetLab.l : null,
      target_lab_a: showTarget ? targetLab.a : null,
      target_lab_b: showTarget ? targetLab.b : null,
      predicted_lab_l: predictedLab.l, predicted_lab_a: predictedLab.a, predicted_lab_b: predictedLab.b,
      delta_e: dE,
    };
    if (mode === "edit" && id) {
      updateRecipe.mutate({ id, ...payload }, {
        onSuccess: () => toast.success("Recipe updated"),
        onError: (e: any) => toast.error(e.message ?? "Save failed"),
      });
    } else {
      createRecipe.mutate(payload, {
        onSuccess: () => toast.success("Recipe saved"),
        onError: (e: any) => toast.error(e.message ?? "Save failed"),
      });
    }
  };

  /** Add a chemical from the quick-access sheet as a new recipe step */
  const handleAddChemToRecipe = (chem: Chemical) => {
    const newStep: RecipeStep = {
      id: crypto.randomUUID(),
      chemical_id:   chem.id,
      chemical_name: chem.name,
      percentage:    2,
      duration_min:  30,
      temperature_c: 40,
      notes:         "",
    };
    setSteps((prev) => [...prev, newStep]);
    setStepsOpen(true);
    toast.success(`"${chem.name}" added to recipe`);
  };

  const isSaving = createRecipe.isPending || updateRecipe.isPending;

  return (
    <AppShell>
      <div className="flex flex-col h-full">

        {/* ── Header ──────────────────────────────────────────── */}
        <div className="flex items-center gap-2 border-b border-border px-4 py-2 shrink-0">
          {/* Steps toggle */}
          <button
            onClick={() => setStepsOpen(!stepsOpen)}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors shrink-0 ${
              stepsOpen ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-surface-2"
            }`}
          >
            <SidebarMinimalisticBoldDuotone size={15} color="currentColor" />
            <span className="hidden sm:inline">Steps</span>
          </button>

          {/* Chemical library button */}
          <button
            onClick={() => setChemSheetOpen(true)}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-surface-2 transition-colors shrink-0"
            title="Browse chemical library"
          >
            <AtomBoldDuotone size={15} color="currentColor" />
            <span className="hidden sm:inline">Chemicals</span>
          </button>

          <Input
            value={recipeName}
            onChange={(e) => setRecipeName(e.target.value)}
            className="h-8 w-40 text-sm font-medium bg-transparent border-transparent hover:border-border focus:border-border"
            disabled={recipeLoading}
          />

          <Select value={substrateId || substrate?.id || ""} onValueChange={setSubstrateId}>
            <SelectTrigger className="h-8 w-40 text-xs">
              <SelectValue placeholder="Select substrate…" />
            </SelectTrigger>
            <SelectContent>
              {substrates.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>

          <div className="flex-1" />

          <Button
            size="sm" variant="outline"
            className="gap-1.5 h-8 text-xs"
            onClick={() => setShowSpecSheet(true)}
          >
            <DocumentBoldDuotone size={14} />
            <span className="hidden md:inline">Spec Sheet</span>
          </Button>
          <Button
            size="sm" className="gap-1.5 h-8"
            onClick={handleSave}
            disabled={isSaving || recipeLoading}
          >
            <DisketteBoldDuotone size={14} />
            {isSaving ? "Saving…" : "Save"}
          </Button>
        </div>

        {/* ── Three-pane body ──────────────────────────────────── */}
        <div className="flex flex-1 overflow-hidden min-h-0">

          {/* LEFT — Recipe steps (collapsible) */}
          <div className={`shrink-0 flex flex-col overflow-hidden transition-all duration-200 border-r border-border ${
            stepsOpen ? "w-80" : "w-0 border-r-0"
          }`}>
            {stepsOpen && (
              <div className="h-full overflow-y-auto p-4 animate-fade-in">
                <RecipeStepEditor
                  steps={steps}
                  onChange={setSteps}
                  chemicals={chemicals}
                  onOpenChemicals={() => setChemSheetOpen(true)}
                />
              </div>
            )}
          </div>

          {/* CENTER — AI preview panel (fixed 420px) */}
          <div className="w-[420px] shrink-0 flex flex-col border-r border-border overflow-hidden">
            <AIPreviewPanel
              predictedLab={predictedLab}
              steps={steps}
              conditions={conditions}
              substrateName={substrate?.name}
            />
          </div>

          {/* RIGHT — Properties / conditions / quality (w-80) */}
          <div className="flex-1 min-w-0 border-l-0 flex flex-col overflow-hidden">
            {/* Tab header */}
            <div className="border-b border-border px-3 pt-2.5 shrink-0">
              <Tabs value={rightTab} onValueChange={(v) => setRightTab(v as typeof rightTab)}>
                <TabsList className="w-full bg-surface-1 h-8">
                  <TabsTrigger value="colour" className="flex-1 text-[10px] gap-1 h-7">
                    <PaletteRoundBoldDuotone size={12} color="currentColor" />Colour
                  </TabsTrigger>
                  <TabsTrigger value="conditions" className="flex-1 text-[10px] gap-1 h-7">
                    <TestTubeBoldDuotone size={12} color="currentColor" />Conditions
                  </TabsTrigger>
                  <TabsTrigger value="quality" className="flex-1 text-[10px] gap-1 h-7">
                    <CheckCircleBoldDuotone size={12} color="currentColor" />Quality
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto">
              {rightTab === "colour" && (
                <div className="animate-fade-in">
                  <RecipePredictionPanel targetLab={showTarget ? targetLab : null} predictedLab={predictedLab} />

                  <div className="border-t border-border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Target Colour</label>
                      <button
                        onClick={() => setShowTarget(!showTarget)}
                        className={`text-xs px-2.5 py-0.5 rounded-full font-medium transition-colors ${
                          showTarget ? "bg-primary text-primary-foreground" : "bg-surface-2 text-muted-foreground hover:bg-surface-3"
                        }`}
                      >
                        {showTarget ? "On" : "Off"}
                      </button>
                    </div>
                    {showTarget && (
                      <div className="space-y-3 animate-fade-in">
                        {(["l", "a", "b"] as const).map((axis) => (
                          <div key={axis} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground font-medium">{axis.toUpperCase()}*</span>
                              <span className="font-mono">{targetLab[axis]}</span>
                            </div>
                            <Slider
                              value={[targetLab[axis]]}
                              onValueChange={([v]) => setTargetLab((p) => ({ ...p, [axis]: v }))}
                              min={axis === "l" ? 0 : -128}
                              max={axis === "l" ? 100 : 128}
                              step={1}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {substrate && (
                    <div className="border-t border-border p-4 space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Substrate</p>
                      <p className="text-sm font-medium text-foreground">{substrate.name}</p>
                      <p className="text-xs font-mono text-muted-foreground">
                        L*{substrate.base_lab_l} a*{substrate.base_lab_a.toFixed(1)} b*{substrate.base_lab_b.toFixed(1)}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {substrate.type} · {substrate.thickness_mm}mm thick
                      </p>
                    </div>
                  )}
                </div>
              )}

              {rightTab === "conditions" && (
                <div className="animate-fade-in">
                  <ProcessConditionsPanel conditions={conditions} onChange={setConditions} />
                </div>
              )}

              {rightTab === "quality" && (
                <div className="animate-fade-in">
                  <QualityTargetsPanel targets={qualityTargets} onChange={setQualityTargets} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chemicals sheet */}
      <ChemicalsSheet
        open={chemSheetOpen}
        onClose={() => setChemSheetOpen(false)}
        chemicals={chemicals}
        onAddToRecipe={handleAddChemToRecipe}
      />

      {/* Spec sheet modal */}
      {showSpecSheet && (
        <SpecSheet
          recipeName={recipeName}
          steps={steps}
          substrateName={substrate?.name}
          substrateType={substrate?.type}
          substrateLab={substrate ? { l: substrate.base_lab_l, a: substrate.base_lab_a, b: substrate.base_lab_b } : undefined}
          predictedLab={predictedLab}
          targetLab={showTarget ? targetLab : null}
          conditions={conditions}
          qualityTargets={qualityTargets}
          onClose={() => setShowSpecSheet(false)}
        />
      )}
    </AppShell>
  );
}
