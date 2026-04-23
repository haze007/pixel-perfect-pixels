import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useState, useMemo } from "react";
import {
  GUIDES,
  CATEGORIES,
  getGuidesByCategory,
  searchGuides,
  type Guide,
  type GuideCategory,
} from "@/data/guides";
import {
  MagniferBoldDuotone,
  RocketBoldDuotone,
  AtomBoldDuotone,
  PaletteRoundBoldDuotone,
  TestTubeBoldDuotone,
  BookBoldDuotone,
  BoxBoldDuotone,
  ChartBoldDuotone,
  SettingsBoldDuotone,
  AltArrowLeftBoldDuotone,
  ClockCircleBoldDuotone,
  SquareAcademicCapBoldDuotone,
  LinkCircleBoldDuotone,
  InfoCircleBoldDuotone,
  DangerCircleBoldDuotone,
  CheckCircleBoldDuotone,
} from "solar-icon-set";

export const Route = createFileRoute("/_authenticated/guides")({
  head: () => ({
    meta: [
      { title: "Guides — TannerySim" },
      { name: "description", content: "Comprehensive leather chemistry and simulation guides" },
    ],
  }),
  component: GuidesPage,
});

/* ── Icon map ──────────────────────────────────────────────────────────── */

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  Rocket:  RocketBoldDuotone,
  Atom:    AtomBoldDuotone,
  Palette: PaletteRoundBoldDuotone,
  Flask:   TestTubeBoldDuotone,
  Book:    BookBoldDuotone,
  Cube:    BoxBoldDuotone,
  Chart:   ChartBoldDuotone,
  Wrench:  SettingsBoldDuotone,
};

const DIFFICULTY_LABEL: Record<string, string> = {
  beginner:     "Beginner",
  intermediate: "Intermediate",
  advanced:     "Advanced",
};

const DIFFICULTY_COLOR: Record<string, string> = {
  beginner:     "#16A34A",
  intermediate: "#D97706",
  advanced:     "#DC2626",
};

const DIFFICULTY_BG: Record<string, string> = {
  beginner:     "#F0FDF4",
  intermediate: "#FFFBEB",
  advanced:     "#FEF2F2",
};

const RESOURCE_TYPE_LABEL: Record<string, string> = {
  course:    "Course",
  article:   "Article",
  video:     "Video",
  reference: "Reference",
};

/* ── Main page ─────────────────────────────────────────────────────────── */

function GuidesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedGuide, setSelectedGuide]       = useState<Guide | null>(null);
  const [query, setQuery]                        = useState("");

  const displayedGuides = useMemo(() => {
    if (query.trim()) return searchGuides(query);
    if (selectedCategory) return getGuidesByCategory(selectedCategory);
    return GUIDES;
  }, [query, selectedCategory]);

  const activeCategory = CATEGORIES.find((c) => c.id === selectedCategory) ?? null;

  return (
    <AppShell>
      <div className="flex h-full overflow-hidden">
        {/* ── Left sidebar ─────────────────────────────────── */}
        <aside className="w-56 shrink-0 border-r border-border flex flex-col overflow-y-auto bg-surface-1/40">
          <div className="p-4 pb-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Categories</h2>
            <button
              onClick={() => { setSelectedCategory(null); setSelectedGuide(null); setQuery(""); }}
              className={`w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium mb-1 transition-colors ${
                !selectedCategory && !query ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-surface-2"
              }`}
            >
              <span>All Guides</span>
              <span className="tabular-nums text-[10px]">{GUIDES.length}</span>
            </button>

            {CATEGORIES.map((cat) => {
              const Icon = ICON_MAP[cat.icon] ?? BookBoldDuotone;
              const count = getGuidesByCategory(cat.id).length;
              const active = selectedCategory === cat.id && !query;
              return (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.id); setSelectedGuide(null); setQuery(""); }}
                  className={`w-full flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-xs transition-colors mb-0.5 ${
                    active ? "text-foreground font-medium" : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                  }`}
                  style={active ? { backgroundColor: cat.bg } : {}}
                >
                  <div
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
                    style={{ backgroundColor: active ? cat.bg : "transparent" }}
                  >
                    <Icon size={14} color={active ? cat.color : "currentColor"} />
                  </div>
                  <span className="flex-1 text-left leading-tight">{cat.label}</span>
                  <span className="tabular-nums text-[10px] text-muted-foreground/60">{count}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* ── Content area ─────────────────────────────────── */}
        {selectedGuide ? (
          <GuideDetail
            guide={selectedGuide}
            onBack={() => setSelectedGuide(null)}
            onNavigate={(g) => setSelectedGuide(g)}
            category={CATEGORIES.find((c) => c.id === selectedGuide.category) ?? null}
          />
        ) : (
          <GuideGrid
            guides={displayedGuides}
            activeCategory={activeCategory}
            query={query}
            onQueryChange={(q) => { setQuery(q); if (q) setSelectedCategory(null); }}
            onSelect={setSelectedGuide}
          />
        )}
      </div>
    </AppShell>
  );
}

/* ── Guide grid ────────────────────────────────────────────────────────── */

function GuideGrid({
  guides,
  activeCategory,
  query,
  onQueryChange,
  onSelect,
}: {
  guides: Guide[];
  activeCategory: GuideCategory | null;
  query: string;
  onQueryChange: (q: string) => void;
  onSelect: (g: Guide) => void;
}) {
  const headerColor = activeCategory?.color ?? "#2563EB";
  const headerBg    = activeCategory?.bg ?? "#EFF6FF";
  const HeaderIcon  = activeCategory ? (ICON_MAP[activeCategory.icon] ?? BookBoldDuotone) : BookBoldDuotone;

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      {/* Header */}
      <div className="border-b border-border px-6 py-4 shrink-0">
        <div className="flex items-center gap-3 mb-3">
          {activeCategory && (
            <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: headerBg }}>
              <HeaderIcon size={18} color={headerColor} />
            </div>
          )}
          <div>
            <h1 className="text-base font-semibold text-foreground">
              {activeCategory ? activeCategory.label : "All Guides"}
            </h1>
            {activeCategory && (
              <p className="text-xs text-muted-foreground">{activeCategory.description}</p>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <MagniferBoldDuotone size={15} color="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search guides…"
            className="w-full h-8 pl-9 pr-3 rounded-lg border border-border bg-surface-1 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {guides.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-14 w-14 rounded-2xl bg-surface-2 flex items-center justify-center mb-4">
              <MagniferBoldDuotone size={24} color="oklch(0.32 0.09 255)" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">No guides found</p>
            <p className="text-xs text-muted-foreground">Try a different search term or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {guides.map((guide, i) => (
              <GuideCard key={guide.id} guide={guide} index={i} onSelect={onSelect} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Guide card ────────────────────────────────────────────────────────── */

function GuideCard({ guide, index, onSelect }: { guide: Guide; index: number; onSelect: (g: Guide) => void }) {
  const cat = CATEGORIES.find((c) => c.id === guide.category);
  const CatIcon = cat ? (ICON_MAP[cat.icon] ?? BookBoldDuotone) : BookBoldDuotone;

  return (
    <button
      onClick={() => onSelect(guide)}
      className="group text-left rounded-xl border border-border bg-background hover:border-primary/40 hover:shadow-md transition-all duration-200 p-4 flex flex-col gap-3 animate-fade-in"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      {/* Category pill */}
      <div className="flex items-center gap-1.5">
        <div className="flex h-5 w-5 items-center justify-center rounded-md" style={{ backgroundColor: cat?.bg ?? "#F4F4F5" }}>
          <CatIcon size={11} color={cat?.color ?? "#6B7280"} />
        </div>
        <span className="text-[10px] font-medium" style={{ color: cat?.color ?? "#6B7280" }}>{cat?.label ?? "Guide"}</span>
      </div>

      {/* Title + desc */}
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-snug mb-1">
          {guide.title}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{guide.description}</p>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-2">
        <span
          className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium"
          style={{ backgroundColor: DIFFICULTY_BG[guide.difficulty], color: DIFFICULTY_COLOR[guide.difficulty] }}
        >
          {DIFFICULTY_LABEL[guide.difficulty]}
        </span>
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground ml-auto">
          <ClockCircleBoldDuotone size={11} color="currentColor" />
          {guide.readTime} min
        </span>
      </div>
    </button>
  );
}

/* ── Guide detail view ─────────────────────────────────────────────────── */

function GuideDetail({
  guide,
  category,
  onBack,
  onNavigate,
}: {
  guide: Guide;
  category: GuideCategory | null;
  onBack: () => void;
  onNavigate: (g: Guide) => void;
}) {
  const CatIcon  = category ? (ICON_MAP[category.icon] ?? BookBoldDuotone) : BookBoldDuotone;
  const relatedGuides = GUIDES.filter((g) => guide.relatedIds.includes(g.id));

  return (
    <div className="flex-1 flex overflow-hidden min-w-0">
      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        {/* Hero */}
        <div className="border-b border-border px-6 py-5 shrink-0">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <AltArrowLeftBoldDuotone size={14} color="currentColor" />
            Back to guides
          </button>

          <div className="flex items-start gap-3">
            {category && (
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl mt-0.5"
                style={{ backgroundColor: category.bg }}
              >
                <CatIcon size={20} color={category.color} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                {category && (
                  <span className="text-xs font-medium" style={{ color: category.color }}>{category.label}</span>
                )}
                <span className="text-muted-foreground/40">·</span>
                <span
                  className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium"
                  style={{ backgroundColor: DIFFICULTY_BG[guide.difficulty], color: DIFFICULTY_COLOR[guide.difficulty] }}
                >
                  {DIFFICULTY_LABEL[guide.difficulty]}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground ml-auto">
                  <ClockCircleBoldDuotone size={11} color="currentColor" />
                  {guide.readTime} min read
                </span>
              </div>
              <h1 className="text-xl font-bold text-foreground leading-snug">{guide.title}</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">{guide.description}</p>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="px-6 py-6 space-y-8 max-w-3xl">
          {guide.sections.map((section, i) => (
            <div key={i} className="space-y-3 animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
              <h2 className="text-base font-semibold text-foreground border-b border-border pb-2">{section.heading}</h2>
              <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">{section.body}</p>

              {section.tip && (
                <div className="flex gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                  <CheckCircleBoldDuotone size={16} color="#16A34A" className="shrink-0 mt-0.5" />
                  <p className="text-xs text-green-800 leading-relaxed">{section.tip}</p>
                </div>
              )}

              {section.warning && (
                <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <DangerCircleBoldDuotone size={16} color="#D97706" className="shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 leading-relaxed">{section.warning}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right sidebar — resources + related */}
      <aside className="w-64 shrink-0 border-l border-border overflow-y-auto">
        {guide.resources.length > 0 && (
          <div className="p-4 border-b border-border">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <SquareAcademicCapBoldDuotone size={13} color="currentColor" />
              Resources
            </h3>
            <div className="space-y-2">
              {guide.resources.map((res, i) => (
                <a
                  key={i}
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col gap-1 rounded-lg border border-border bg-surface-1 px-3 py-2.5 hover:border-primary/40 hover:bg-primary/5 transition-all"
                >
                  <div className="flex items-center gap-1.5">
                    <LinkCircleBoldDuotone size={12} color="oklch(0.32 0.09 255)" />
                    <span className="text-[10px] font-medium text-primary uppercase tracking-wide">
                      {RESOURCE_TYPE_LABEL[res.type]}
                    </span>
                    {res.free && (
                      <span className="ml-auto text-[9px] font-semibold text-green-700 bg-green-100 rounded-full px-1.5 py-0.5">FREE</span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-foreground group-hover:text-primary transition-colors leading-snug">{res.title}</p>
                </a>
              ))}
            </div>
          </div>
        )}

        {relatedGuides.length > 0 && (
          <div className="p-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <InfoCircleBoldDuotone size={13} color="currentColor" />
              Related Guides
            </h3>
            <div className="space-y-1.5">
              {relatedGuides.map((rel) => {
                const relCat = CATEGORIES.find((c) => c.id === rel.category);
                const RelIcon = relCat ? (ICON_MAP[relCat.icon] ?? BookBoldDuotone) : BookBoldDuotone;
                return (
                  <button
                    key={rel.id}
                    onClick={() => onNavigate(rel)}
                    className="w-full text-left group flex items-start gap-2 rounded-lg px-2.5 py-2 hover:bg-surface-2 transition-colors"
                  >
                    <div
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md mt-0.5"
                      style={{ backgroundColor: relCat?.bg ?? "#F4F4F5" }}
                    >
                      <RelIcon size={10} color={relCat?.color ?? "#6B7280"} />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground group-hover:text-primary transition-colors leading-snug">{rel.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{rel.readTime} min</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
