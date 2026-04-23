import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useState } from "react";
import { useChemicals, useCreateChemical, useUpdateChemical, useDeleteChemical, useBulkCreateChemicals } from "@/hooks/use-chemicals";
import { useTanneryId } from "@/hooks/use-tannery";
import { ChemicalFormDialog } from "@/components/catalogue/ChemicalFormDialog";
import { CsvImportDialog } from "@/components/catalogue/CsvImportDialog";
import { labToHex } from "@/lib/lab-to-rgb";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  AddCircleBoldDuotone,
  UploadBoldDuotone,
  MagniferBoldDuotone,
  Pen2BoldDuotone,
  TrashBinMinimalisticBoldDuotone,
  AtomBoldDuotone,
  DangerCircleBoldDuotone,
} from "solar-icon-set";
import type { Chemical, ChemicalInsert, ChemicalUpdate } from "@/hooks/use-chemicals";
import { Constants } from "@/integrations/supabase/types";
import { toast } from "sonner";

const CATEGORIES = Constants.public.Enums.chemical_category;

export const Route = createFileRoute("/_authenticated/catalogue")({
  head: () => ({
    meta: [{ title: "Chemical Catalogue — TannerySim" }],
  }),
  component: CataloguePage,
});

function CataloguePage() {
  const { data: chemicals, isLoading } = useChemicals();
  const { data: tanneryId, isLoading: tanneryLoading, isError: tanneryError } = useTanneryId();
  const createChemical = useCreateChemical();
  const updateChemical = useUpdateChemical();
  const deleteChemical = useDeleteChemical();
  const bulkCreate = useBulkCreateChemicals();

  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [csvOpen, setCsvOpen] = useState(false);
  const [editingChemical, setEditingChemical] = useState<Chemical | null>(null);

  const filtered = (chemicals ?? []).filter((c) => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.supplier?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchCat = catFilter === "all" || c.category === catFilter;
    return matchSearch && matchCat;
  });

  const handleCreate = (data: ChemicalInsert | (ChemicalUpdate & { id: string })) => {
    createChemical.mutate(data as ChemicalInsert, {
      onSuccess: () => {
        setFormOpen(false);
        toast.success("Chemical added");
      },
      onError: (err) => toast.error(`Failed to add chemical: ${err.message}`),
    });
  };

  const handleUpdate = (data: ChemicalInsert | (ChemicalUpdate & { id: string })) => {
    const { id, ...rest } = data as ChemicalUpdate & { id: string };
    updateChemical.mutate({ id, ...rest }, {
      onSuccess: () => {
        setEditingChemical(null);
        toast.success("Chemical updated");
      },
      onError: (err) => toast.error(`Failed to update chemical: ${err.message}`),
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this chemical?")) {
      deleteChemical.mutate(id, {
        onSuccess: () => toast.success("Chemical deleted"),
        onError: (err) => toast.error(`Failed to delete: ${err.message}`),
      });
    }
  };

  const handleBulkImport = (chemicals: ChemicalInsert[]) => {
    bulkCreate.mutate(chemicals, {
      onSuccess: () => {
        setCsvOpen(false);
        toast.success(`${chemicals.length} chemicals imported`);
      },
      onError: (err) => toast.error(`Import failed: ${err.message}`),
    });
  };

  return (
    <AppShell>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 animate-fade-in">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Chemical Catalogue</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isLoading ? "Loading…" : `${filtered.length} chemical${filtered.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline" size="sm" className="gap-1.5"
              onClick={() => setCsvOpen(true)}
              disabled={tanneryLoading || tanneryError}
              title={tanneryError ? "Tannery could not be loaded — refresh the page" : undefined}
            >
              <UploadBoldDuotone size={14} />Import CSV
            </Button>
            <Button
              size="sm" className="gap-1.5"
              onClick={() => setFormOpen(true)}
              disabled={tanneryLoading || tanneryError}
              title={tanneryError ? "Tannery could not be loaded — refresh the page" : undefined}
            >
              <AddCircleBoldDuotone size={14} />Add Chemical
            </Button>
          </div>
        </div>

        {/* Tannery provisioning error banner */}
        {tanneryError && (
          <div className="flex items-center gap-2 bg-red-50 border-b border-red-100 px-6 py-2.5">
            <DangerCircleBoldDuotone size={15} color="#DC2626" />
            <p className="text-xs text-red-700">
              Could not load your tannery — forms may not work. Try refreshing the page.
            </p>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-3 border-b border-border px-6 py-2">
          <div className="relative flex-1 max-w-xs">
            <MagniferBoldDuotone size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search chemicals..."
              className="pl-8 h-8 text-sm"
            />
          </div>
          <Select value={catFilter} onValueChange={setCatFilter}>
            <SelectTrigger className="w-40 h-8 text-sm">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-12 rounded-lg border border-border bg-surface-1 animate-skeleton"
                  style={{ animationDelay: `${i * 80}ms` }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
              <div className="h-16 w-16 rounded-2xl bg-surface-2 flex items-center justify-center mb-4">
                <AtomBoldDuotone size={28} color="oklch(0.32 0.09 255)" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">
                {search || catFilter !== "all" ? "No chemicals match" : "Catalogue is empty"}
              </h3>
              <p className="text-xs text-muted-foreground text-center max-w-xs mb-5">
                {search || catFilter !== "all"
                  ? "Try adjusting your search or filter."
                  : "Add chemicals with their Lab* colour data to start building recipes."}
              </p>
              {!search && catFilter === "all" && (
                <button
                  onClick={() => setFormOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors duration-150"
                >
                  <AddCircleBoldDuotone size={15} color="currentColor" />
                  Add first chemical
                </button>
              )}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-surface-1 sticky top-0 z-10">
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-medium text-muted-foreground">Colour</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Name</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Category</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Supplier</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">L*a*b*</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">CI</th>
                  <th className="w-20" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((chem) => {
                  const hex = chem.lab_l != null ? labToHex(chem.lab_l, chem.lab_a ?? 0, chem.lab_b ?? 0) : null;
                  return (
                    <tr key={chem.id} className="border-b border-border hover:bg-surface-2/50 transition-colors animate-fade-in">
                      <td className="p-3">
                        {hex ? (
                          <div className="h-6 w-6 rounded border border-border" style={{ backgroundColor: hex }} />
                        ) : (
                          <div className="h-6 w-6 rounded border border-border bg-surface-2" />
                        )}
                      </td>
                      <td className="p-3 font-medium text-foreground">{chem.name}</td>
                      <td className="p-3">
                        <Badge variant="secondary" className="text-xs font-normal">
                          {chem.category.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="p-3 text-muted-foreground">{chem.supplier || "—"}</td>
                      <td className="p-3 font-mono text-xs text-muted-foreground">
                        {chem.lab_l != null ? `${chem.lab_l.toFixed(0)} / ${(chem.lab_a ?? 0).toFixed(0)} / ${(chem.lab_b ?? 0).toFixed(0)}` : "—"}
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">{chem.colour_index || "—"}</td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingChemical(chem)}>
                            <Pen2BoldDuotone size={14} color="currentColor" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(chem.id)}>
                            <TrashBinMinimalisticBoldDuotone size={14} color="currentColor" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Dialogs — always rendered; tanneryId may be undefined while loading (submit is disabled) */}
      <ChemicalFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        tanneryId={tanneryId}
        onSubmit={handleCreate}
        loading={createChemical.isPending}
      />
      <ChemicalFormDialog
        open={!!editingChemical}
        onOpenChange={(v) => { if (!v) setEditingChemical(null); }}
        chemical={editingChemical}
        tanneryId={tanneryId}
        onSubmit={handleUpdate}
        loading={updateChemical.isPending}
      />
      <CsvImportDialog
        open={csvOpen}
        onOpenChange={setCsvOpen}
        tanneryId={tanneryId ?? ""}
        onImport={handleBulkImport}
        loading={bulkCreate.isPending}
      />
    </AppShell>
  );
}
