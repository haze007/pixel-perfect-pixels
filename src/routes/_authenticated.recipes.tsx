import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";

export const Route = createFileRoute("/_authenticated/recipes")({
  head: () => ({
    meta: [{ title: "Recipe Library — TannerySim" }],
  }),
  component: RecipesPage,
});

function RecipesPage() {
  return (
    <AppShell>
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Recipe Library</h1>
          <p className="text-muted-foreground text-sm">Coming in Sprint 3</p>
        </div>
      </div>
    </AppShell>
  );
}
