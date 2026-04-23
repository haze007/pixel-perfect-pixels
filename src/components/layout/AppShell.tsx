import { useState, useEffect } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { signOut } from "@/lib/auth";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { LogoMark, faviconSvgString } from "@/components/layout/Logo";
import {
  Home2BoldDuotone,
  BookBoldDuotone,
  Logout2BoldDuotone,
  AtomBoldDuotone,
  SettingsBoldDuotone,
  ChatRoundDotsBoldDuotone,
  AltArrowLeftBoldDuotone,
  AltArrowRightBoldDuotone,
  SidebarMinimalisticBoldDuotone,
  SquareAcademicCapBoldDuotone,
} from "solar-icon-set";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AiChatPanel } from "@/components/ai/AiChatPanel";
import { useChemicals } from "@/hooks/use-chemicals";

const DEFAULT_COLOR = "#2563EB";

function useActiveSectionColor(pathname: string) {
  const active = NAV_ITEMS.find((item) => pathname.startsWith(item.to));
  const color = active?.iconColor ?? DEFAULT_COLOR;

  useEffect(() => {
    const svg = faviconSvgString(color);
    const dataUri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.type = "image/svg+xml";
    link.href = dataUri;
  }, [color]);

  return color;
}

/* Each nav section gets its own flat color - icon bg + icon tint */
const NAV_ITEMS = [
  {
    to: "/dashboard" as const,
    label: "Dashboard",
    Icon: Home2BoldDuotone,
    iconColor: "#2563EB",
    bg: "#EFF6FF",
    bgActive: "#DBEAFE",
  },
  {
    to: "/recipes" as const,
    label: "Recipes",
    Icon: BookBoldDuotone,
    iconColor: "#16A34A",
    bg: "#F0FDF4",
    bgActive: "#DCFCE7",
  },
  {
    to: "/catalogue" as const,
    label: "Catalogue",
    Icon: AtomBoldDuotone,
    iconColor: "#D97706",
    bg: "#FFFBEB",
    bgActive: "#FEF3C7",
  },
  {
    to: "/guides" as const,
    label: "Guides",
    Icon: SquareAcademicCapBoldDuotone,
    iconColor: "#7C3AED",
    bg: "#F5F3FF",
    bgActive: "#EDE9FE",
  },
  {
    to: "/settings" as const,
    label: "Settings",
    Icon: SettingsBoldDuotone,
    iconColor: "#6B7280",
    bg: "#F4F4F5",
    bgActive: "#E4E4E7",
  },
];

interface AppShellProps {
  children: React.ReactNode;
  rightPanel?: React.ReactNode;
}

export function AppShell({ children, rightPanel }: AppShellProps) {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { data: chemicals } = useChemicals();
  const location = useLocation();
  const logoColor = useActiveSectionColor(location.pathname);

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "?";

  return isMobile
    ? <MobileShell chemicals={chemicals ?? []} initials={initials} rightPanel={rightPanel} location={location} logoColor={logoColor}>{children}</MobileShell>
    : <DesktopShell chemicals={chemicals ?? []} initials={initials} rightPanel={rightPanel} location={location} logoColor={logoColor}>{children}</DesktopShell>;
}

/* ─── Desktop ─────────────────────────────────────────────────────────── */

function DesktopShell({ children, rightPanel, initials, chemicals, location, logoColor }: {
  children: React.ReactNode;
  rightPanel?: React.ReactNode;
  initials: string;
  chemicals: any[];
  location: { pathname: string };
  logoColor: string;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(!!rightPanel);
  const [rightTab, setRightTab] = useState<"panel" | "ai">(rightPanel ? "panel" : "ai");

  return (
    <div className="flex h-screen bg-sidebar overflow-hidden">
      {/* Sidebar */}
      <aside className={`flex flex-col shrink-0 transition-all duration-150 ${sidebarOpen ? "w-56" : "w-14"}`}>
        {/* Logo */}
        <div className="flex h-12 items-center px-3 gap-2.5">
          <div className="shrink-0 transition-colors duration-300">
            <LogoMark color={logoColor} size={28} />
          </div>
          {sidebarOpen && (
            <span className="text-sm font-semibold text-foreground truncate tracking-tight">
              Tannery Sim
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-1 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors ${
                  active ? "bg-transparent" : "hover:bg-sidebar-accent"
                }`}
              >
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors"
                  style={{ backgroundColor: active ? item.bgActive : item.bg }}
                >
                  <item.Icon size={16} color={item.iconColor} />
                </div>
                {sidebarOpen && (
                  <span className={active ? "font-medium text-foreground" : "text-muted-foreground"}>
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-2 pb-3 space-y-0.5">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-muted-foreground hover:bg-sidebar-accent transition-colors"
          >
            {sidebarOpen ? <AltArrowLeftBoldDuotone size={17} /> : <AltArrowRightBoldDuotone size={17} />}
            {sidebarOpen && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 p-2 overflow-hidden min-w-0">
        <header className="flex h-10 shrink-0 items-center justify-between px-1">
          <span className="text-xs text-muted-foreground">Leather Chemistry Simulation</span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost" size="icon"
              onClick={() => { setRightOpen(!rightOpen); if (!rightOpen) setRightTab("ai"); }}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title="AI Assistant"
            >
              <ChatRoundDotsBoldDuotone size={16} />
            </Button>
            {rightPanel && (
              <Button
                variant="ghost" size="icon"
                onClick={() => { setRightOpen(!rightOpen); setRightTab("panel"); }}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <SidebarMinimalisticBoldDuotone size={16} />
              </Button>
            )}
            <Button
              variant="ghost" size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => signOut()}
              title="Sign out"
            >
              <Logout2BoldDuotone size={16} />
            </Button>
            <Avatar className="h-7 w-7">
              <AvatarFallback className="text-[11px] bg-primary/10 text-primary font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Inset white card */}
        <div className="flex flex-1 overflow-hidden rounded-xl border border-border bg-background shadow-sm">
          <main className="flex-1 overflow-hidden min-w-0">{children}</main>

          {rightOpen && (
            <aside className="w-80 shrink-0 border-l border-border flex flex-col overflow-hidden">
              {rightPanel ? (
                <Tabs
                  value={rightTab}
                  onValueChange={(v) => setRightTab(v as "panel" | "ai")}
                  className="flex flex-col h-full"
                >
                  <TabsList className="mx-2 mt-2 bg-surface-1 shrink-0">
                    <TabsTrigger value="panel" className="text-xs flex-1">Details</TabsTrigger>
                    <TabsTrigger value="ai" className="text-xs flex-1">AI Chat</TabsTrigger>
                  </TabsList>
                  <div className="flex-1 overflow-hidden">
                    {rightTab === "panel" ? (
                      <div className="h-full overflow-y-auto">{rightPanel}</div>
                    ) : (
                      <AiChatPanel chemicals={chemicals} />
                    )}
                  </div>
                </Tabs>
              ) : (
                <AiChatPanel chemicals={chemicals} />
              )}
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Mobile ──────────────────────────────────────────────────────────── */

function MobileShell({ children, rightPanel, initials, chemicals, location, logoColor }: {
  children: React.ReactNode;
  rightPanel?: React.ReactNode;
  initials: string;
  chemicals: any[];
  location: { pathname: string };
  logoColor: string;
}) {
  return (
    <div className="flex flex-col h-screen bg-sidebar overflow-hidden">
      {/* Top bar */}
      <header className="flex h-10 shrink-0 items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <div className="shrink-0 transition-colors duration-300">
            <LogoMark color={logoColor} size={24} />
          </div>
          <span className="text-sm font-semibold text-foreground tracking-tight">Tannery Sim</span>
        </div>
        <div className="flex items-center gap-1">
          {/* AI Chat Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                <ChatRoundDotsBoldDuotone size={16} />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[70vh] p-0 rounded-t-xl border-border">
              <AiChatPanel chemicals={chemicals} />
            </SheetContent>
          </Sheet>

          {/* Right panel Sheet (only when panel exists) */}
          {rightPanel && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                  <SidebarMinimalisticBoldDuotone size={16} />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[70vh] p-0 rounded-t-xl border-border">
                <div className="h-full overflow-y-auto">{rightPanel}</div>
              </SheetContent>
            </Sheet>
          )}

          <Button
            variant="ghost" size="icon"
            className="h-8 w-8 text-muted-foreground"
            onClick={() => signOut()}
          >
            <Logout2BoldDuotone size={16} />
          </Button>
          <Avatar className="h-7 w-7">
            <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Inset white card — main content */}
      <div className="flex-1 overflow-hidden px-2">
        <div className="h-full rounded-xl border border-border bg-background shadow-sm overflow-hidden">
          {children}
        </div>
      </div>

      {/* Bottom nav — horizontally scrollable, no visible scrollbar */}
      <nav
        className="flex shrink-0 items-center overflow-x-auto py-2 px-2 gap-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}
      >
        {NAV_ITEMS.map((item) => {
          const active = location.pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className="flex-none flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-colors hover:bg-sidebar-accent min-w-[60px]"
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                style={{ backgroundColor: active ? item.bgActive : item.bg }}
              >
                <item.Icon size={18} color={item.iconColor} />
              </div>
              <span
                className="text-[10px] leading-none"
                style={{ color: active ? item.iconColor : "#71717A" }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
