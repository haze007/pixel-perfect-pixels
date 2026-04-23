import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useRecipes, useDeleteRecipe } from "@/hooks/use-recipes";
import { labToHex } from "@/lib/lab-to-rgb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrashBinMinimalisticBoldDuotone,
  TestTubeBoldDuotone,
  AddCircleBoldDuotone,
  ArrowRightBoldDuotone,
} from "solar-icon-set";

export const Route = createFileRoute("/_authenticated/recipes")({
  head: () => ({
    meta: [{ title: "Recipe Library — TannerySim" }],
  }),
  component: RecipesPage,
});

function SkeletonRecipeCard() {
  return (
    <div className="rounded-xl border border-border bg-surface-1 p-4 space-y-3 animate-skeleton">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-4 w-28 rounded bg-surface-2" />
          <div className="h-3 w-20 rounded bg-surface-2" />
        </div>
        <div className="h-8 w-8 rounded-lg bg-surface-2" />
      </div>
      <div className="flex gap-2">
        <div className="h-5 w-14 rounded-full bg-surface-2" />
      </div>
      <div className="flex items-center justify-between pt-1 border-t border-border">
        <div className="h-3 w-16 rounded bg-surface-2" />
        <div className="h-6 w-6 rounded bg-surface-2" />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 animate-fade-in">
      <div className="h-20 w-20 rounded-2xl bg-surface-2 flex items-center justify-center mb-5">
        <TestTubeBoldDuotone size={32} color="oklch(0.32 0.09 255)" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-2">No recipes yet</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
        Build your first dyeing or finishing recipe. The simulation engine will predict the resulting colour from your chemical steps.
      </p>
      <Link to="/studio" search={{ mode: "new", id: undefined }}>
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors duration-150">
          <AddCircleBoldDuotone size={16} color="currentColor" />
          Create first recipe
        </button>
      </Link>
    </div>
  );
}

function RecipesPage() {
  const { data: recipes, isLoading } = useRecipes();
  const deleteRecipe = useDeleteRecipe();

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Delete this recipe?")) deleteRecipe.mutate(id);
  };

  return (
    <AppShell>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 animate-fade-in">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Recipe Library</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isLoading ? "Loading…" : `${recipes?.length ?? 0} recipe${recipes?.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <Link to="/studio" search={{ mode: "new", id: undefined }}>
            <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors duration-150">
              <TestTubeBoldDuotone size={14} color="currentColor" />
              New Recipe
            </button>
          </Link>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="grid gap-3 p-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonRecipeCard key={i} />
              ))}
            </div>
          ) : !recipes || recipes.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid gap-3 p-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {recipes.map((r, i) => {
                const hex = r.predicted_lab_l != null
                  ? labToHex(r.predicted_lab_l, r.predicted_lab_a ?? 0, r.predicted_lab_b ?? 0)
                  : null;
                const steps = Array.isArray(r.steps) ? r.steps : [];
                return (
                  <Link
                    key={r.id}
                    to="/studio"
                    search={{ mode: "edit", id: r.id }}
                    className="group block rounded-xl border border-border bg-surface-1 p-4 space-y-3 hover:border-primary/30 hover:shadow-sm transition-all duration-200 animate-fade-in"
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 pr-2">
                        <h3 className="text-sm font-medium text-foreground truncate">{r.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{steps.length} step{steps.length !== 1 ? "s" : ""} · v{r.version}</p>
                      </div>
                      {hex ? (
                        <div
                          className="h-9 w-9 shrink-0 rounded-lg border border-border transition-transform duration-200 group-hover:scale-105"
                          style={{ backgroundColor: hex }}
                        />
                      ) : (
                        <div className="h-9 w-9 shrink-0 rounded-lg border border-border bg-surface-2 flex items-center justify-center">
                          <TestTubeBoldDuotone size={14} color="oklch(0.62 0.005 255)" />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs font-normal">{r.status}</Badge>
                      {r.delta_e != null && (
                        <span className={`text-xs font-mono ${r.delta_e < 2 ? "text-success" : r.delta_e < 3.5 ? "text-warning" : "text-destructive"}`}>
                          ΔE {r.delta_e.toFixed(1)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-border">
                      <span className="text-xs text-muted-foreground">{new Date(r.updated_at).toLocaleDateString()}</span>
                      <div className="flex items-center gap-1">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 mr-1">
                          <ArrowRightBoldDuotone size={13} color="oklch(0.52 0.008 255)" />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/8"
                          onClick={(e) => handleDelete(e, r.id)}
                        >
                          <TrashBinMinimalisticBoldDuotone size={14} color="currentColor" />
                        </Button>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
