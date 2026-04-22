import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [{ title: "Dashboard — TannerySim" }],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <AppShell>
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Coming in Sprint 2</p>
        </div>
      </div>
    </AppShell>
  );
}
