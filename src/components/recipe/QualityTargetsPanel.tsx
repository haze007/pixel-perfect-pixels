import { useState } from "react";
import { QUALITY_TESTS, QUALITY_CATEGORIES, type QualityTest } from "@/lib/quality-standards";
import { CheckCircleBoldDuotone, DangerCircleBoldDuotone, InfoCircleBoldDuotone } from "solar-icon-set";

export interface QualityTargets {
  [testId: string]: {
    enabled: boolean;
    targetValue: number;
    achievedValue?: number; // filled in after lab measurement
  };
}

export function defaultQualityTargets(): QualityTargets {
  const out: QualityTargets = {};
  for (const t of QUALITY_TESTS) {
    out[t.id] = { enabled: true, targetValue: t.passValue };
  }
  return out;
}

interface Props {
  targets: QualityTargets;
  onChange: (t: QualityTargets) => void;
}

const CATEGORY_ICONS: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  fastness:  CheckCircleBoldDuotone,
  chemical:  DangerCircleBoldDuotone,
  physical:  InfoCircleBoldDuotone,
  comfort:   CheckCircleBoldDuotone,
};

function TestRow({
  test,
  entry,
  onChange,
}: {
  test: QualityTest;
  entry: QualityTargets[string];
  onChange: (e: QualityTargets[string]) => void;
}) {
  const passing =
    entry.achievedValue != null
      ? test.higherIsBetter
        ? entry.achievedValue >= entry.targetValue
        : entry.achievedValue <= entry.targetValue
      : null;

  return (
    <div
      className={`rounded-lg border px-3 py-2.5 space-y-1.5 transition-colors ${
        entry.enabled ? "border-border bg-background" : "border-border/50 bg-surface-1 opacity-50"
      }`}
    >
      <div className="flex items-start gap-2">
        <button
          onClick={() => onChange({ ...entry, enabled: !entry.enabled })}
          className={`mt-0.5 h-4 w-4 shrink-0 rounded border transition-colors ${
            entry.enabled
              ? "border-primary bg-primary"
              : "border-border bg-surface-2"
          }`}
        >
          {entry.enabled && (
            <svg viewBox="0 0 12 12" fill="none" className="w-full h-full p-0.5">
              <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold text-muted-foreground/70 font-mono">{test.standard}</span>
            <span className="text-xs font-semibold text-foreground leading-snug">{test.title}</span>
            {passing !== null && (
              <span
                className={`ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                  passing ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}
              >
                {passing ? "PASS" : "FAIL"}
              </span>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground leading-snug mt-0.5">{test.passMark}</p>
        </div>
      </div>

      {entry.enabled && (
        <div className="flex gap-2 pl-6">
          <div className="flex-1 space-y-1">
            <label className="text-[9px] text-muted-foreground uppercase tracking-wide">Target</label>
            <input
              type="number"
              value={entry.targetValue}
              onChange={(e) => onChange({ ...entry, targetValue: parseFloat(e.target.value) || 0 })}
              className="w-full h-6 rounded border border-border bg-surface-1 px-2 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
            />
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-[9px] text-muted-foreground uppercase tracking-wide">Achieved</label>
            <input
              type="number"
              value={entry.achievedValue ?? ""}
              placeholder="—"
              onChange={(e) => {
                const v = e.target.value === "" ? undefined : parseFloat(e.target.value);
                onChange({ ...entry, achievedValue: v });
              }}
              className="w-full h-6 rounded border border-border bg-surface-1 px-2 text-xs font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/40"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function QualityTargetsPanel({ targets, onChange }: Props) {
  const [expandedCat, setExpandedCat] = useState<string | null>("fastness");

  const update = (id: string, entry: QualityTargets[string]) => {
    onChange({ ...targets, [id]: entry });
  };

  return (
    <div className="p-4 space-y-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Quality Targets
      </p>

      {QUALITY_CATEGORIES.map((cat) => {
        const tests = QUALITY_TESTS.filter((t) => t.category === cat.id);
        const enabled = tests.filter((t) => targets[t.id]?.enabled).length;
        const Icon = CATEGORY_ICONS[cat.id] ?? CheckCircleBoldDuotone;
        const open = expandedCat === cat.id;

        return (
          <div key={cat.id} className="rounded-xl border border-border overflow-hidden">
            <button
              onClick={() => setExpandedCat(open ? null : cat.id)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-surface-1 transition-colors"
              style={{ backgroundColor: open ? cat.bg : undefined }}
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-md" style={{ backgroundColor: cat.bg }}>
                <Icon size={13} color={cat.color} />
              </div>
              <span className="text-xs font-semibold text-foreground flex-1 text-left">{cat.label}</span>
              <span className="text-[10px] text-muted-foreground">{enabled}/{tests.length}</span>
              <svg
                viewBox="0 0 12 12"
                fill="none"
                className={`w-3 h-3 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
              >
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {open && (
              <div className="p-2 space-y-1.5 border-t border-border bg-surface-1/40">
                {tests.map((test) => (
                  <TestRow
                    key={test.id}
                    test={test}
                    entry={targets[test.id] ?? { enabled: true, targetValue: test.passValue }}
                    onChange={(e) => update(test.id, e)}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
