import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/hooks/use-auth";
import { useTannery } from "@/hooks/use-tannery";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [{ title: "Settings — TannerySim" }],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  const { data: tannery } = useTannery();

  const fullName = user?.user_metadata?.full_name || user?.email || "User";
  const initials = fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <AppShell>
      <div className="p-6 space-y-6 overflow-y-auto h-full max-w-2xl">
        <h1 className="text-xl font-semibold text-foreground">Settings</h1>

        <div className="rounded-lg border border-border bg-surface-1 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Profile</h2>
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-foreground">{fullName}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-surface-1 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Tannery</h2>
          {tannery ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Name</span>
                <span className="text-sm text-foreground">{tannery.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Slug</span>
                <span className="text-sm font-mono text-muted-foreground">{tannery.slug}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="text-sm text-muted-foreground">{new Date(tannery.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Loading...</p>
          )}
        </div>

        <div className="rounded-lg border border-border bg-surface-1 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Plan</h2>
          <div className="flex items-center gap-2">
            <Badge className="bg-primary/20 text-primary">Free Trial</Badge>
            <span className="text-xs text-muted-foreground">Unlimited access during beta</span>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
