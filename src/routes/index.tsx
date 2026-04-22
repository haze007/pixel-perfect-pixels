import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-foreground">Welcome back</h1>
          <Link to="/studio">
            <Button>Open Studio</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border px-6 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
            TS
          </div>
          <span className="text-lg font-semibold text-foreground">TannerySim</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
          <Link to="/signup">
            <Button size="sm">Get started</Button>
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-6">
        <div className="max-w-2xl text-center space-y-6">
          <h1 className="text-5xl font-bold tracking-tight text-foreground">
            Leather Chemistry
            <span className="block text-primary">Simulation Platform</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Predict colour, texture and material behaviour of leather finishing recipes.
            Visualise results in real-time 3D before going to the lab.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/signup">
              <Button size="lg">Start free trial</Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg">Sign in</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
