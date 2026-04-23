import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { labToHex } from "@/lib/lab-to-rgb";
import type { Chemical, ChemicalInsert, ChemicalUpdate } from "@/hooks/use-chemicals";
import { Constants } from "@/integrations/supabase/types";

const CATEGORIES = Constants.public.Enums.chemical_category;

interface ChemicalFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chemical?: Chemical | null;
  tanneryId: string;
  onSubmit: (data: ChemicalInsert | (ChemicalUpdate & { id: string })) => void;
  loading?: boolean;
}

export function ChemicalFormDialog({
  open,
  onOpenChange,
  chemical,
  tanneryId,
  onSubmit,
  loading,
}: ChemicalFormDialogProps) {
  const [name, setName] = useState(chemical?.name ?? "");
  const [category, setCategory] = useState<string>(chemical?.category ?? "dye");
  const [supplier, setSupplier] = useState(chemical?.supplier ?? "");
  const [colourIndex, setColourIndex] = useState(chemical?.colour_index ?? "");
  const [labL, setLabL] = useState(chemical?.lab_l ?? 50);
  const [labA, setLabA] = useState(chemical?.lab_a ?? 0);
  const [labB, setLabB] = useState(chemical?.lab_b ?? 0);

  const isEdit = !!chemical;
  const hex = labToHex(labL, labA, labB);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const base = {
      name,
      category: category as any,
      supplier: supplier || null,
      colour_index: colourIndex || null,
      lab_l: labL,
      lab_a: labA,
      lab_b: labB,
      tannery_id: tanneryId,
    };
    if (isEdit) {
      onSubmit({ ...base, id: chemical.id });
    } else {
      onSubmit(base);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Chemical" : "Add Chemical"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Derma Black NR" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Supplier</label>
              <Input value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="BASF" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Colour Index</label>
            <Input value={colourIndex} onChange={(e) => setColourIndex(e.target.value)} placeholder="C.I. 12195" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-foreground">LAB Colour</label>
              <div className="h-6 w-6 rounded border border-border" style={{ backgroundColor: hex }} />
              <span className="text-xs font-mono text-muted-foreground">{hex}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">L*</span><span className="font-mono">{labL}</span></div>
              <Slider value={[labL]} onValueChange={([v]) => setLabL(v)} min={0} max={100} step={1} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">a*</span><span className="font-mono">{labA}</span></div>
              <Slider value={[labA]} onValueChange={([v]) => setLabA(v)} min={-128} max={128} step={1} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">b*</span><span className="font-mono">{labB}</span></div>
              <Slider value={[labB]} onValueChange={([v]) => setLabB(v)} min={-128} max={128} step={1} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{isEdit ? "Save" : "Add"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
