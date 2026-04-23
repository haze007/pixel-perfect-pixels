import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { ChemicalInsert } from "@/hooks/use-chemicals";
import type { Database } from "@/integrations/supabase/types";

type ChemicalCategory = Database["public"]["Enums"]["chemical_category"];

const VALID_CATEGORIES: ChemicalCategory[] = [
  "dye", "fatliquor", "retanning_agent", "surfactant", "acid", "base", "fixing_agent", "other",
];

interface CsvImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tanneryId: string;
  onImport: (chemicals: ChemicalInsert[]) => void;
  loading?: boolean;
}

function parseCategory(raw: string): ChemicalCategory {
  const normalized = raw.toLowerCase().trim().replace(/\s+/g, "_");
  if (VALID_CATEGORIES.includes(normalized as ChemicalCategory)) return normalized as ChemicalCategory;
  return "other";
}

function parseCsv(text: string, tanneryId: string): { data: ChemicalInsert[]; errors: string[] } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return { data: [], errors: ["File must have a header and at least one row"] };

  const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const nameIdx = header.findIndex((h) => h === "name");
  if (nameIdx === -1) return { data: [], errors: ["Missing 'name' column in header"] };

  const catIdx = header.findIndex((h) => h === "category");
  const supIdx = header.findIndex((h) => h === "supplier");
  const ciIdx = header.findIndex((h) => ["colour_index", "color_index", "ci"].includes(h));
  const lIdx = header.findIndex((h) => ["lab_l", "l", "l*"].includes(h));
  const aIdx = header.findIndex((h) => ["lab_a", "a", "a*"].includes(h));
  const bIdx = header.findIndex((h) => ["lab_b", "b", "b*"].includes(h));

  const data: ChemicalInsert[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.trim());
    const name = cols[nameIdx];
    if (!name) { errors.push(`Row ${i + 1}: missing name`); continue; }

    data.push({
      name,
      tannery_id: tanneryId,
      category: catIdx >= 0 ? parseCategory(cols[catIdx]) : "other",
      supplier: supIdx >= 0 ? cols[supIdx] || null : null,
      colour_index: ciIdx >= 0 ? cols[ciIdx] || null : null,
      lab_l: lIdx >= 0 ? parseFloat(cols[lIdx]) || null : null,
      lab_a: aIdx >= 0 ? parseFloat(cols[aIdx]) || null : null,
      lab_b: bIdx >= 0 ? parseFloat(cols[bIdx]) || null : null,
    });
  }

  return { data, errors };
}

export function CsvImportDialog({ open, onOpenChange, tanneryId, onImport, loading }: CsvImportDialogProps) {
  const [preview, setPreview] = useState<ChemicalInsert[] | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const result = parseCsv(text, tanneryId);
      setPreview(result.data);
      setErrors(result.errors);
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (preview && preview.length > 0) {
      onImport(preview);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) { setPreview(null); setErrors([]); } }}>
      <DialogContent className="max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle>Import Chemicals from CSV</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            CSV must have a <code className="font-mono text-foreground">name</code> column. Optional: category, supplier, colour_index, lab_l, lab_a, lab_b.
          </p>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleFile}
            className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
          />

          {errors.length > 0 && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive space-y-1">
              {errors.map((e, i) => <p key={i}>{e}</p>)}
            </div>
          )}

          {preview && (
            <div className="space-y-2">
              <p className="text-sm text-foreground font-medium">{preview.length} chemicals ready to import</p>
              <div className="max-h-48 overflow-auto rounded border border-border">
                <table className="w-full text-xs">
                  <thead className="bg-surface-2 sticky top-0">
                    <tr>
                      <th className="p-2 text-left text-muted-foreground font-medium">Name</th>
                      <th className="p-2 text-left text-muted-foreground font-medium">Category</th>
                      <th className="p-2 text-left text-muted-foreground font-medium">Supplier</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.slice(0, 20).map((c, i) => (
                      <tr key={i} className="border-t border-border">
                        <td className="p-2 text-foreground">{c.name}</td>
                        <td className="p-2 text-muted-foreground">{c.category}</td>
                        <td className="p-2 text-muted-foreground">{c.supplier || "—"}</td>
                      </tr>
                    ))}
                    {preview.length > 20 && (
                      <tr className="border-t border-border">
                        <td colSpan={3} className="p-2 text-center text-muted-foreground">
                          ...and {preview.length - 20} more
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleImport} disabled={!preview || preview.length === 0 || loading}>
              {loading ? "Importing..." : `Import ${preview?.length ?? 0} chemicals`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
