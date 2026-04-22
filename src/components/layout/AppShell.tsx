import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { signOut } from "@/lib/auth";
import { useAuth } from "@/hooks/use-auth";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  FlaskConical,
  BookOpen,
  Globe,
  Target,
  Settings,
  LogOut,
  Beaker,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const NAV_ITEMS = [
  { to: "/_authenticated/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/_authenticated/studio", label: "Recipe Studio", icon: FlaskConical },
  { to: "/_authenticated/recipes", label: "Recipe Library", icon: BookOpen },
  { to: "/_authenticated/catalogue", label: "My Catalogue", icon: Beaker },
] as const;

interface AppShellProps {
  children: React.ReactNode;
  rightPanel?: React.ReactNode;
}

export function AppShell({ children, rightPanel }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(!!rightPanel);
  const { user } = useAuth();
  const location = useLocation();

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={`flex flex-col border-r border-border bg-sidebar transition-all duration-200 ${
          sidebarOpen ? "w-60" : "w-14"
        }`}
      >
        {/* Logo */}
        <div className="flex h-12 items-center gap-2 border-b border-border px-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
            TS
          </div>
          {sidebarOpen && <span className="text-sm font-semibold text-foreground">TannerySim</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 p-2">
          {NAV_ITEMS.map((item) => {
            const active = location.pathname === item.to.replace("/_authenticated", "");
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse button */}
        <div className="border-t border-border p-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent/50 hover:text-foreground"
          >
            {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            {sidebarOpen && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* TopBar */}
        <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-surface-1 px-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="text-foreground font-medium">TannerySim</span>
            <span className="text-border">•</span>
            <span>Leather Chemistry Simulation</span>
          </div>
          <div className="flex items-center gap-2">
            {rightPanel && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setRightOpen(!rightOpen)}
                className="h-8 w-8"
              >
                {rightOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => signOut()}>
              <LogOut className="h-4 w-4" />
            </Button>
            <Avatar className="h-7 w-7">
              <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Content area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Main Canvas */}
          <main className="flex-1 overflow-hidden">{children}</main>

          {/* Right Panel */}
          {rightPanel && rightOpen && (
            <aside className="w-80 shrink-0 border-l border-border bg-surface-1 overflow-y-auto">
              {rightPanel}
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
