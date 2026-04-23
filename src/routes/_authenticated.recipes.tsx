import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useRecipes, useDeleteRecipe } from "@/hooks/use-recipes";
import { labToHex } from "@/lib/lab-to-rgb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, FlaskConical } from "lucide-react";

export const Route = createFileRoute("/_authenticated/recipes")({
  head: () => ({
    meta: [{ title: "Recipe Library — TannerySim" }],
  }),
  component: RecipesPage,
});

function RecipesPage() {
  const { data: recipes, isLoading } = useRecipes();
  const deleteRecipe = useDeleteRecipe();

  const handleDelete = (id: string) => {
    if (confirm("Delete this recipe?")) deleteRecipe.mutate(id);
  };

  return (
    <AppShell>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between border-b border-border px-6 py-3">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Recipe Library</h1>
            <p className="text-xs text-muted-foreground">{recipes?.length ?? 0} recipes</p>
          </div>
          <Link to="/studio">
            <Button size="sm"><FlaskConical className="h-3.5 w-3.5 mr-1.5" />New Recipe</Button>
          </Link>
        </div>

        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : !recipes || recipes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <p className="text-sm">No recipes yet</p>
              <Link to="/studio"><Button variant="link" size="sm" className="mt-1">Create your first recipe</Button></Link>
            </div>
          ) : (
            <div className="grid gap-3 p-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {recipes.map((r) => {
                const hex = r.predicted_lab_l != null
                  ? labToHex(r.predicted_lab_l, r.predicted_lab_a ?? 0, r.predicted_lab_b ?? 0)
                  : null;
                const steps = Array.isArray(r.steps) ? r.steps : [];
                return (
                  <div key={r.id} className="rounded-lg border border-border bg-surface-1 p-4 space-y-3 hover:border-primary/40 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-foreground">{r.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{steps.length} steps · v{r.version}</p>
                      </div>
                      {hex && <div className="h-8 w-8 rounded border border-border shrink-0" style={{ backgroundColor: hex }} />}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">{r.status}</Badge>
                      {r.delta_e != null && (
                        <span className={`text-xs font-mono ${r.delta_e < 2 ? "text-success" : r.delta_e < 3.5 ? "text-warning" : "text-destructive"}`}>
                          ΔE {r.delta_e.toFixed(1)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-border">
                      <span className="text-xs text-muted-foreground">{new Date(r.updated_at).toLocaleDateString()}</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(r.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
