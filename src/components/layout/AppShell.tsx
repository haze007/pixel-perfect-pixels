import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { signOut } from "@/lib/auth";
import { useAuth } from "@/hooks/use-auth";
import {
  Home2BoldDuotone,
  TestTubeBoldDuotone,
  BookBoldDuotone,
  Logout2BoldDuotone,
  Dropper2BoldDuotone,
  SettingsBoldDuotone,
  ChatRoundDotsBoldDuotone,
} from "solar-icon-set";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AiChatPanel } from "@/components/ai/AiChatPanel";
import { useChemicals } from "@/hooks/use-chemicals";
import { ChevronLeft, ChevronRight, PanelRightClose, PanelRightOpen } from "lucide-react";

const NAV_ITEMS = [
  { to: "/dashboard" as const, label: "Dashboard", Icon: Home2BoldDuotone },
  { to: "/studio" as const, label: "Recipe Studio", Icon: FlaskBoldDuotone },
  { to: "/recipes" as const, label: "Recipe Library", Icon: BookBoldDuotone },
  { to: "/catalogue" as const, label: "My Catalogue", Icon: Dropper2BoldDuotone },
  { to: "/settings" as const, label: "Settings", Icon: SettingsBoldDuotone },
];

interface AppShellProps {
  children: React.ReactNode;
  rightPanel?: React.ReactNode;
}

export function AppShell({ children, rightPanel }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(!!rightPanel);
  const [rightTab, setRightTab] = useState<"panel" | "ai">(rightPanel ? "panel" : "ai");
  const { user } = useAuth();
  const { data: chemicals } = useChemicals();
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
        <div className="flex h-12 items-center gap-2 border-b border-border px-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
            TS
          </div>
          {sidebarOpen && <span className="text-sm font-semibold text-foreground">TannerySim</span>}
        </div>

        <nav className="flex-1 space-y-1 p-2">
          {NAV_ITEMS.map((item) => {
            const active = location.pathname === item.to;
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
                <item.Icon size={18} />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-2 space-y-1">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent/50 hover:text-foreground"
          >
            {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            {sidebarOpen && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-surface-1 px-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="text-foreground font-medium">TannerySim</span>
            <span className="text-border">•</span>
            <span>Leather Chemistry Simulation</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => { setRightOpen(!rightOpen); if (!rightOpen) setRightTab("ai"); }}
              className="h-8 w-8"
              title="AI Assistant"
            >
              <ChatRoundDotsBoldDuotone size={16} />
            </Button>
            {rightPanel && (
              <Button variant="ghost" size="icon" onClick={() => { setRightOpen(!rightOpen); setRightTab("panel"); }} className="h-8 w-8">
                {rightOpen && rightTab === "panel" ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => signOut()}>
              <Logout2BoldDuotone size={16} />
            </Button>
            <Avatar className="h-7 w-7">
              <AvatarFallback className="text-xs bg-primary text-primary-foreground">{initials}</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-hidden">{children}</main>
          {rightOpen && (
            <aside className="w-80 shrink-0 border-l border-border bg-surface-1 flex flex-col overflow-hidden">
              {rightPanel ? (
                <>
                  <Tabs value={rightTab} onValueChange={(v) => setRightTab(v as "panel" | "ai")} className="flex flex-col h-full">
                    <TabsList className="mx-2 mt-2 bg-surface-2">
                      <TabsTrigger value="panel" className="text-xs flex-1">Details</TabsTrigger>
                      <TabsTrigger value="ai" className="text-xs flex-1">AI Chat</TabsTrigger>
                    </TabsList>
                    <div className="flex-1 overflow-hidden">
                      {rightTab === "panel" ? (
                        <div className="h-full overflow-y-auto">{rightPanel}</div>
                      ) : (
                        <AiChatPanel chemicals={chemicals ?? []} />
                      )}
                    </div>
                  </Tabs>
                </>
              ) : (
                <AiChatPanel chemicals={chemicals ?? []} />
              )}
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
