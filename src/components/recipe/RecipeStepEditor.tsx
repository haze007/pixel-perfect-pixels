import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AddCircleBoldDuotone, TrashBinMinimalisticBoldDuotone, AtomBoldDuotone } from "solar-icon-set";
import type { Chemical } from "@/hooks/use-chemicals";

export interface RecipeStep {
  id: string;
  chemical_id: string;
  chemical_name: string;
  percentage: number;
  duration_min: number;
  temperature_c: number;
  notes: string;
}

interface RecipeStepEditorProps {
  steps: RecipeStep[];
  onChange: (steps: RecipeStep[]) => void;
  chemicals: Chemical[];
  /** Called when user taps "Browse chemicals" — opens the chemicals sheet in the parent */
  onOpenChemicals?: () => void;
}

export function RecipeStepEditor({ steps, onChange, chemicals, onOpenChemicals }: RecipeStepEditorProps) {
  const addStep = () => {
    onChange([
      ...steps,
      {
        id: crypto.randomUUID(),
        chemical_id: "",
        chemical_name: "",
        percentage: 2,
        duration_min: 30,
        temperature_c: 40,
        notes: "",
      },
    ]);
  };

  const updateStep = (idx: number, patch: Partial<RecipeStep>) => {
    const next = [...steps];
    next[idx] = { ...next[idx], ...patch };
    if (patch.chemical_id) {
      const chem = chemicals.find((c) => c.id === patch.chemical_id);
      if (chem) next[idx].chemical_name = chem.name;
    }
    onChange(next);
  };

  const removeStep = (idx: number) => {
    onChange(steps.filter((_, i) => i !== idx));
  };

  const hasChemicals = chemicals.length > 0;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Recipe Steps</h3>
        <div className="flex items-center gap-1.5">
          {onOpenChemicals && (
            <button
              onClick={onOpenChemicals}
              className="flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors"
              title="Browse chemical library"
            >
              <AtomBoldDuotone size={12} color="currentColor" />
              Library
            </button>
          )}
          <Button
            variant="outline" size="sm"
            className="gap-1.5 h-7 text-xs"
            onClick={addStep}
            disabled={!hasChemicals}
            title={hasChemicals ? "Add a step" : "No chemicals available — open Library first"}
          >
            <AddCircleBoldDuotone size={13} />
            Add Step
          </Button>
        </div>
      </div>

      {/* Empty state */}
      {steps.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-surface-1/50 py-8 px-4 text-center space-y-2">
          {hasChemicals ? (
            <>
              <p className="text-xs text-muted-foreground">No steps yet.</p>
              <p className="text-[10px] text-muted-foreground/70">
                Tap <strong>Add Step</strong> above or pick from the{" "}
                {onOpenChemicals ? (
                  <button
                    onClick={onOpenChemicals}
                    className="text-primary underline underline-offset-2 hover:no-underline"
                  >
                    chemical library
                  </button>
                ) : (
                  "chemical library"
                )}.
              </p>
            </>
          ) : (
            <>
              <div className="flex justify-center mb-2">
                <div className="h-10 w-10 rounded-xl bg-surface-2 flex items-center justify-center">
                  <AtomBoldDuotone size={20} color="oklch(0.32 0.09 255 / 0.5)" />
                </div>
              </div>
              <p className="text-xs font-medium text-foreground">No chemicals loaded</p>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                The community chemical library may not be seeded yet, or your catalogue is empty.
              </p>
              {onOpenChemicals && (
                <button
                  onClick={onOpenChemicals}
                  className="mt-1 text-[10px] text-primary hover:underline"
                >
                  Open Library →
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Steps list */}
      <div className="space-y-2">
        {steps.map((step, idx) => (
          <div key={step.id} className="rounded-lg border border-border bg-surface-1 p-3 space-y-2 animate-fade-in">
            {/* Row 1: step number + chemical selector */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-muted-foreground/60 w-4 shrink-0 text-center">{idx + 1}</span>
              <div className="flex-1">
                <Select value={step.chemical_id} onValueChange={(v) => updateStep(idx, { chemical_id: v })}>
                  <SelectTrigger className="h-8 text-xs w-full">
                    <SelectValue placeholder="Select chemical…" />
                  </SelectTrigger>
                  <SelectContent>
                    {chemicals.length === 0 ? (
                      <div className="px-3 py-2 text-xs text-muted-foreground">No chemicals — open Library</div>
                    ) : (
                      chemicals.map((c) => (
                        <SelectItem key={c.id} value={c.id} className="text-xs">{c.name}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="ghost" size="icon"
                className="h-7 w-7 shrink-0 text-destructive hover:text-destructive/80"
                onClick={() => removeStep(idx)}
              >
                <TrashBinMinimalisticBoldDuotone size={14} color="currentColor" />
              </Button>
            </div>

            {/* Row 2: % weight, temp, duration */}
            <div className="grid grid-cols-3 gap-2 pl-6">
              <div className="space-y-0.5">
                <label className="text-[9px] text-muted-foreground uppercase tracking-wide">% Weight</label>
                <Input
                  type="number"
                  value={step.percentage}
                  onChange={(e) => updateStep(idx, { percentage: parseFloat(e.target.value) || 0 })}
                  className="h-7 text-xs"
                  min={0} step={0.5}
                />
              </div>
              <div className="space-y-0.5">
                <label className="text-[9px] text-muted-foreground uppercase tracking-wide">Temp °C</label>
                <Input
                  type="number"
                  value={step.temperature_c}
                  onChange={(e) => updateStep(idx, { temperature_c: parseFloat(e.target.value) || 0 })}
                  className="h-7 text-xs"
                />
              </div>
              <div className="space-y-0.5">
                <label className="text-[9px] text-muted-foreground uppercase tracking-wide">Min</label>
                <Input
                  type="number"
                  value={step.duration_min}
                  onChange={(e) => updateStep(idx, { duration_min: parseFloat(e.target.value) || 0 })}
                  className="h-7 text-xs"
                />
              </div>
            </div>

            {/* Row 3: notes (collapsed by default) */}
            <div className="pl-6">
              <Input
                value={step.notes}
                onChange={(e) => updateStep(idx, { notes: e.target.value })}
                className="h-7 text-xs"
                placeholder="Notes (optional)"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
