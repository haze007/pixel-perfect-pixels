import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, GripVertical } from "lucide-react";
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
}

function newStepId() {
  return crypto.randomUUID();
}

export function RecipeStepEditor({ steps, onChange, chemicals }: RecipeStepEditorProps) {
  const addStep = () => {
    onChange([
      ...steps,
      {
        id: newStepId(),
        chemical_id: "",
        chemical_name: "",
        percentage: 1,
        duration_min: 30,
        temperature_c: 40,
        notes: "",
      },
    ]);
  };

  const updateStep = (idx: number, patch: Partial<RecipeStep>) => {
    const next = [...steps];
    next[idx] = { ...next[idx], ...patch };
    // If chemical changed, update name
    if (patch.chemical_id) {
      const chem = chemicals.find((c) => c.id === patch.chemical_id);
      if (chem) next[idx].chemical_name = chem.name;
    }
    onChange(next);
  };

  const removeStep = (idx: number) => {
    onChange(steps.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Recipe Steps</h3>
        <Button variant="outline" size="sm" onClick={addStep}>
          <Plus className="h-3.5 w-3.5 mr-1" />Add Step
        </Button>
      </div>

      {steps.length === 0 && (
        <p className="text-xs text-muted-foreground py-4 text-center">No steps yet. Add a step to start building your recipe.</p>
      )}

      <div className="space-y-2">
        {steps.map((step, idx) => (
          <div key={step.id} className="flex items-start gap-2 rounded-lg border border-border bg-surface-1 p-3">
            <div className="flex items-center pt-2 text-muted-foreground">
              <GripVertical className="h-4 w-4" />
              <span className="text-xs font-mono w-4">{idx + 1}</span>
            </div>
            <div className="flex-1 grid grid-cols-4 gap-2">
              <div className="col-span-2 space-y-1">
                <label className="text-xs text-muted-foreground">Chemical</label>
                <Select value={step.chemical_id} onValueChange={(v) => updateStep(idx, { chemical_id: v })}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select chemical" />
                  </SelectTrigger>
                  <SelectContent>
                    {chemicals.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">% Weight</label>
                <Input
                  type="number"
                  value={step.percentage}
                  onChange={(e) => updateStep(idx, { percentage: parseFloat(e.target.value) || 0 })}
                  className="h-8 text-xs"
                  min={0}
                  step={0.1}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Temp °C</label>
                <Input
                  type="number"
                  value={step.temperature_c}
                  onChange={(e) => updateStep(idx, { temperature_c: parseFloat(e.target.value) || 0 })}
                  className="h-8 text-xs"
                />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-xs text-muted-foreground">Duration (min)</label>
                <Input
                  type="number"
                  value={step.duration_min}
                  onChange={(e) => updateStep(idx, { duration_min: parseFloat(e.target.value) || 0 })}
                  className="h-8 text-xs"
                />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-xs text-muted-foreground">Notes</label>
                <Input
                  value={step.notes}
                  onChange={(e) => updateStep(idx, { notes: e.target.value })}
                  className="h-8 text-xs"
                  placeholder="Optional"
                />
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7 mt-5 text-destructive" onClick={() => removeStep(idx)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
