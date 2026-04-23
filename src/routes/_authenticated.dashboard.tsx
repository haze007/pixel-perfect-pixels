import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useRecipes } from "@/hooks/use-recipes";
import { useChemicals } from "@/hooks/use-chemicals";
import { useSubstrates } from "@/hooks/use-substrates";
import { useAuth } from "@/hooks/use-auth";
import { labToHex } from "@/lib/lab-to-rgb";
import { Link } from "@tanstack/react-router";
import {
  TestTubeBoldDuotone,
  Dropper2BoldDuotone,
  LayersBoldDuotone,
  Chart2BoldDuotone,
  AddCircleBoldDuotone,
  AtomBoldDuotone,
  BookmarkBoldDuotone,
  ArrowRightBoldDuotone,
} from "solar-icon-set";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [{ title: "Dashboard — TannerySim" }],
  }),
  component: DashboardPage,
});

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border bg-surface-1 p-5 animate-skeleton">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-surface-2" />
        <div className="space-y-2 flex-1">
          <div className="h-5 w-14 rounded bg-surface-2" />
          <div className="h-3 w-20 rounded bg-surface-2" />
        </div>
      </div>
      <div className="mt-4 h-3 w-12 rounded bg-surface-2" />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  to,
  iconColor,
  iconBg,
  delay = 0,
}: {
  icon: any;
  label: string;
  value: number | string;
  to: string;
  iconColor: string;
  iconBg: string;
  delay?: number;
}) {
  return (
    <Link
      to={to}
      className="group rounded-xl border border-border bg-surface-1 p-5 hover:border-primary/30 hover:shadow-sm transition-all duration-200 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-3">
        <div
          className="h-11 w-11 shrink-0 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105"
          style={{ backgroundColor: iconBg }}
        >
          <Icon size={20} color={iconColor} />
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary transition-colors duration-150">
        <span>View all</span>
        <ArrowRightBoldDuotone size={11} color="currentColor" />
      </div>
    </Link>
  );
}

function EmptyRecipes() {
  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
      <div className="h-16 w-16 rounded-2xl bg-surface-2 flex items-center justify-center mb-4">
        <TestTubeBoldDuotone size={28} color="oklch(0.32 0.09 255)" />
      </div>
      <h3 className="text-sm font-semibold text-foreground mb-1">No recipes yet</h3>
      <p className="text-xs text-muted-foreground text-center max-w-xs mb-5">
        Create your first recipe to start simulating leather dyeing and finishing processes.
      </p>
      <Link to="/studio" search={{ mode: "new", id: undefined }}>
        <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors duration-150">
          <AddCircleBoldDuotone size={15} color="currentColor" />
          Create first recipe
        </button>
      </Link>
    </div>
  );
}

function RecipeRow({ r, index }: { r: any; index: number }) {
  const hex = r.predicted_lab_l != null
    ? labToHex(r.predicted_lab_l, r.predicted_lab_a ?? 0, r.predicted_lab_b ?? 0)
    : null;
  const steps = Array.isArray(r.steps) ? r.steps : [];
  return (
    <Link
      to="/studio"
      search={{ mode: "edit", id: r.id }}
      className="group flex items-center gap-3 rounded-xl border border-border bg-surface-1 p-3.5 hover:border-primary/30 hover:shadow-sm transition-all duration-200 animate-fade-in"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="h-10 w-10 shrink-0 rounded-lg border border-border overflow-hidden transition-transform duration-200 group-hover:scale-105 flex items-center justify-center"
        style={{ backgroundColor: hex ?? undefined }}>
        {!hex && <BookmarkBoldDuotone size={14} color="oklch(0.62 0.005 255)" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{r.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {steps.length} step{steps.length !== 1 ? "s" : ""} · {r.status}
          {r.delta_e != null && (
            <span className={`ml-1 font-mono ${r.delta_e < 2 ? "text-success" : r.delta_e < 3.5 ? "text-warning" : "text-destructive"}`}>
              · ΔE {r.delta_e.toFixed(1)}
            </span>
          )}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-muted-foreground">{new Date(r.updated_at).toLocaleDateString()}</span>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <ArrowRightBoldDuotone size={13} color="oklch(0.52 0.008 255)" />
        </div>
      </div>
    </Link>
  );
}

function DashboardPage() {
  const { user } = useAuth();
  const { data: recipes = [], isLoading: recipesLoading } = useRecipes();
  const { data: chemicals = [], isLoading: chemLoading } = useChemicals();
  const { data: substrates = [], isLoading: subLoading } = useSubstrates();

  const isLoading = recipesLoading || chemLoading || subLoading;
  const recentRecipes = recipes.slice(0, 5);
  const firstName = user?.user_metadata?.full_name?.split(" ")[0] ?? null;

  const avgDeltaE = (() => {
    const scored = recipes.filter(r => r.delta_e != null);
    if (!scored.length) return null;
    return (scored.reduce((s, r) => s + (r.delta_e ?? 0), 0) / scored.length).toFixed(1);
  })();

  return (
    <AppShell>
      <div className="p-6 space-y-8 overflow-y-auto h-full">
        {/* Greeting */}
        <div className="animate-fade-in">
          <h1 className="text-xl font-semibold text-foreground">
            {firstName ? `Good day, ${firstName}` : "Dashboard"}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Overview of your tannery workspace</p>
        </div>

        {/* Stat cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={TestTubeBoldDuotone} label="Recipes" value={recipes.length}
              to="/recipes" iconColor="#16A34A" iconBg="#F0FDF4" delay={0} />
            <StatCard icon={Dropper2BoldDuotone} label="Chemicals" value={chemicals.length}
              to="/catalogue" iconColor="#D97706" iconBg="#FFFBEB" delay={60} />
            <StatCard icon={LayersBoldDuotone} label="Substrates" value={substrates.length}
              to="/catalogue" iconColor="#2563EB" iconBg="#EFF6FF" delay={120} />
            <StatCard icon={Chart2BoldDuotone} label="Avg ΔE" value={avgDeltaE ?? "—"}
              to="/recipes" iconColor="#6B7280" iconBg="#F4F4F5" delay={180} />
          </div>
        )}

        {/* Quick actions */}
        <div className="animate-fade-in" style={{ animationDelay: "80ms" }}>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quick Actions</h2>
          <div className="flex flex-wrap gap-2">
            <Link to="/studio" search={{ mode: "new", id: undefined }}>
              <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors duration-150">
                <AddCircleBoldDuotone size={14} color="currentColor" />
                New Recipe
              </button>
            </Link>
            <Link to="/catalogue">
              <button className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3.5 py-2 text-sm font-medium text-foreground hover:bg-surface-1 hover:border-primary/30 transition-all duration-150">
                <AtomBoldDuotone size={14} color="oklch(0.32 0.09 255)" />
                Add Chemical
              </button>
            </Link>
            <Link to="/recipes">
              <button className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3.5 py-2 text-sm font-medium text-foreground hover:bg-surface-1 hover:border-primary/30 transition-all duration-150">
                <BookmarkBoldDuotone size={14} color="oklch(0.32 0.09 255)" />
                Recipe Library
              </button>
            </Link>
          </div>
        </div>

        {/* Recent recipes */}
        <div>
          <div className="flex items-center justify-between mb-3 animate-fade-in" style={{ animationDelay: "100ms" }}>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recent Recipes</h2>
            {recentRecipes.length > 0 && (
              <Link to="/recipes" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                View all <ArrowRightBoldDuotone size={11} color="currentColor" />
              </Link>
            )}
          </div>

          {recipesLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-[62px] rounded-xl border border-border bg-surface-1 animate-skeleton"
                  style={{ animationDelay: `${i * 100}ms` }} />
              ))}
            </div>
          ) : recentRecipes.length === 0 ? (
            <EmptyRecipes />
          ) : (
            <div className="space-y-2">
              {recentRecipes.map((r, i) => <RecipeRow key={r.id} r={r} index={i} />)}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
