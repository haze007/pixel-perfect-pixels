import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { LeatherViewer } from "@/components/viewer/LeatherViewer";
import { RecipeStepEditor, type RecipeStep } from "@/components/recipe/RecipeStepEditor";
import { RecipePredictionPanel } from "@/components/recipe/RecipePredictionPanel";
import { useState, useMemo } from "react";
import { useChemicals } from "@/hooks/use-chemicals";
import { useSubstrates } from "@/hooks/use-substrates";
import { useCreateRecipe } from "@/hooks/use-recipes";
import { useTanneryId } from "@/hooks/use-tannery";
import { predictRecipeLab, deltaE76 } from "@/lib/color-science";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/studio")({
  head: () => ({
    meta: [
      { title: "Recipe Studio — TannerySim" },
      { name: "description", content: "3D leather simulation studio" },
    ],
  }),
  component: StudioPage,
});

function StudioPage() {
  const { data: chemicals = [] } = useChemicals();
  const { data: substrates = [] } = useSubstrates();
  const { data: tanneryId } = useTanneryId();
  const createRecipe = useCreateRecipe();

  const [recipeName, setRecipeName] = useState("Untitled Recipe");
  const [substrateId, setSubstrateId] = useState<string>("");
  const [steps, setSteps] = useState<RecipeStep[]>([]);
  const [targetLab, setTargetLab] = useState<{ l: number; a: number; b: number }>({ l: 40, a: 15, b: 10 });
  const [showTarget, setShowTarget] = useState(false);

  const substrate = substrates.find((s) => s.id === substrateId) ?? substrates[0];
  const baseLab = substrate
    ? { l: substrate.base_lab_l, a: substrate.base_lab_a, b: substrate.base_lab_b }
    : { l: 70, a: 0, b: 10 };

  const stepsWithLab = useMemo(() =>
    steps.map((s) => {
      const chem = chemicals.find((c) => c.id === s.chemical_id);
      return { ...s, lab_l: chem?.lab_l ?? null, lab_a: chem?.lab_a ?? null, lab_b: chem?.lab_b ?? null };
    }),
    [steps, chemicals]
  );

  const predictedLab = useMemo(() => predictRecipeLab(stepsWithLab, baseLab), [stepsWithLab, baseLab]);

  const handleSave = () => {
    if (!tanneryId) return;
    const dE = showTarget ? deltaE76(targetLab.l, targetLab.a, targetLab.b, predictedLab.l, predictedLab.a, predictedLab.b) : null;
    createRecipe.mutate({
      name: recipeName,
      tannery_id: tanneryId,
      substrate_id: substrateId || null,
      steps: steps as any,
      target_lab_l: showTarget ? targetLab.l : null,
      target_lab_a: showTarget ? targetLab.a : null,
      target_lab_b: showTarget ? targetLab.b : null,
      predicted_lab_l: predictedLab.l,
      predicted_lab_a: predictedLab.a,
      predicted_lab_b: predictedLab.b,
      delta_e: dE,
    }, {
      onSuccess: () => toast.success("Recipe saved"),
    });
  };

  const rightPanel = (
    <div className="flex flex-col h-full overflow-y-auto">
      <RecipePredictionPanel
        targetLab={showTarget ? targetLab : null}
        predictedLab={predictedLab}
      />
      <div className="border-t border-border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Target Colour</label>
          <button
            onClick={() => setShowTarget(!showTarget)}
            className={`text-xs px-2 py-0.5 rounded ${showTarget ? "bg-primary text-primary-foreground" : "bg-surface-2 text-muted-foreground"}`}
          >
            {showTarget ? "On" : "Off"}
          </button>
        </div>
        {showTarget && (
          <div className="space-y-2">
            <div className="space-y-1">
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">L*</span><span className="font-mono">{targetLab.l}</span></div>
              <Slider value={[targetLab.l]} onValueChange={([v]) => setTargetLab(p => ({ ...p, l: v }))} min={0} max={100} step={1} />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">a*</span><span className="font-mono">{targetLab.a}</span></div>
              <Slider value={[targetLab.a]} onValueChange={([v]) => setTargetLab(p => ({ ...p, a: v }))} min={-128} max={128} step={1} />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">b*</span><span className="font-mono">{targetLab.b}</span></div>
              <Slider value={[targetLab.b]} onValueChange={([v]) => setTargetLab(p => ({ ...p, b: v }))} min={-128} max={128} step={1} />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <AppShell rightPanel={rightPanel}>
      <div className="flex flex-col h-full">
        {/* Studio header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-2">
          <div className="flex items-center gap-3">
            <Input
              value={recipeName}
              onChange={(e) => setRecipeName(e.target.value)}
              className="h-8 w-56 text-sm font-medium bg-transparent border-transparent hover:border-border focus:border-border"
            />
            <Select value={substrateId || substrate?.id || ""} onValueChange={setSubstrateId}>
              <SelectTrigger className="h-8 w-48 text-xs">
                <SelectValue placeholder="Select substrate" />
              </SelectTrigger>
              <SelectContent>
                {substrates.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button size="sm" onClick={handleSave} disabled={createRecipe.isPending}>
            <Save className="h-3.5 w-3.5 mr-1.5" />
            {createRecipe.isPending ? "Saving..." : "Save Recipe"}
          </Button>
        </div>

        {/* Main area: 3D viewer + step editor */}
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 min-h-0">
            <LeatherViewer lab={predictedLab} />
          </div>
          <div className="w-96 border-l border-border overflow-y-auto p-4">
            <RecipeStepEditor steps={steps} onChange={setSteps} chemicals={chemicals} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
