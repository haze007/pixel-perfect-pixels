import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useRecipes } from "@/hooks/use-recipes";
import { useChemicals } from "@/hooks/use-chemicals";
import { useSubstrates } from "@/hooks/use-substrates";
import { labToHex } from "@/lib/lab-to-rgb";
import { Link } from "@tanstack/react-router";
import { FlaskConical, Beaker, Layers, Activity } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [{ title: "Dashboard — TannerySim" }],
  }),
  component: DashboardPage,
});

function StatCard({ icon: Icon, label, value, to }: { icon: any; label: string; value: number | string; to: string }) {
  return (
    <Link to={to} className="rounded-lg border border-border bg-surface-1 p-4 hover:border-primary/40 transition-colors">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center">
          <Icon className="h-4.5 w-4.5 text-primary" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </Link>
  );
}

function DashboardPage() {
  const { data: recipes = [] } = useRecipes();
  const { data: chemicals = [] } = useChemicals();
  const { data: substrates = [] } = useSubstrates();

  const recentRecipes = recipes.slice(0, 5);

  return (
    <AppShell>
      <div className="p-6 space-y-6 overflow-y-auto h-full">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Overview of your tannery workspace</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={FlaskConical} label="Recipes" value={recipes.length} to="/recipes" />
          <StatCard icon={Beaker} label="Chemicals" value={chemicals.length} to="/catalogue" />
          <StatCard icon={Layers} label="Substrates" value={substrates.length} to="/catalogue" />
          <StatCard icon={Activity} label="Avg ΔE" value={
            recipes.filter(r => r.delta_e != null).length > 0
              ? (recipes.filter(r => r.delta_e != null).reduce((s, r) => s + (r.delta_e ?? 0), 0) / recipes.filter(r => r.delta_e != null).length).toFixed(1)
              : "—"
          } to="/recipes" />
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Recent Recipes</h2>
          {recentRecipes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recipes yet. <Link to="/studio" className="text-primary hover:underline">Create one in the Studio</Link>.</p>
          ) : (
            <div className="space-y-2">
              {recentRecipes.map((r) => {
                const hex = r.predicted_lab_l != null
                  ? labToHex(r.predicted_lab_l, r.predicted_lab_a ?? 0, r.predicted_lab_b ?? 0)
                  : null;
                return (
                  <div key={r.id} className="flex items-center gap-3 rounded-lg border border-border bg-surface-1 p-3 hover:border-primary/30 transition-colors">
                    {hex ? (
                      <div className="h-8 w-8 rounded border border-border shrink-0" style={{ backgroundColor: hex }} />
                    ) : (
                      <div className="h-8 w-8 rounded border border-border bg-surface-2 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{r.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(Array.isArray(r.steps) ? r.steps : []).length} steps · {r.status}
                        {r.delta_e != null && ` · ΔE ${r.delta_e.toFixed(1)}`}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{new Date(r.updated_at).toLocaleDateString()}</span>
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
