/**
 * SpecSheet — printable / exportable leather recipe specification document.
 * Rendered as a modal overlay; uses @media print CSS to produce a clean A4 page.
 */
import { useRef } from "react";
import { QUALITY_TESTS, QUALITY_CATEGORIES } from "@/lib/quality-standards";
import type { QualityTargets } from "@/components/recipe/QualityTargetsPanel";
import type { ProcessConditions } from "@/lib/process-conditions";
import { SUBSTRATE_ORIGIN_LABELS, TANNING_TYPE_LABELS, estimateDyeUptake } from "@/lib/process-conditions";
import { labToHex } from "@/lib/lab-to-rgb";
import type { RecipeStep } from "@/components/recipe/RecipeStepEditor";
import { CloseCircleBoldDuotone, PrinterBoldDuotone } from "solar-icon-set";

/* ── helpers ───────────────────────────────────────────────────────────── */

function deltaE76(l1: number, a1: number, b1: number, l2: number, a2: number, b2: number) {
  return Math.sqrt((l1 - l2) ** 2 + (a1 - a2) ** 2 + (b1 - b2) ** 2);
}

function gradeColor(passing: boolean | null) {
  if (passing === null) return "#6B7280";
  return passing ? "#15803D" : "#DC2626";
}

function gradeBg(passing: boolean | null) {
  if (passing === null) return "#F4F4F5";
  return passing ? "#DCFCE7" : "#FEE2E2";
}

/* ── types ──────────────────────────────────────────────────────────────── */

export interface SpecSheetProps {
  recipeName: string;
  tanneryName?: string;
  refNumber?: string;
  createdAt?: string;
  steps: RecipeStep[];
  substrateId?: string;
  substrateName?: string;
  substrateType?: string;
  substrateLab?: { l: number; a: number; b: number };
  predictedLab: { l: number; a: number; b: number };
  targetLab?: { l: number; a: number; b: number } | null;
  conditions: ProcessConditions;
  qualityTargets: QualityTargets;
  onClose: () => void;
}

/* ── main component ─────────────────────────────────────────────────────── */

export function SpecSheet({
  recipeName,
  tanneryName,
  refNumber,
  createdAt,
  steps,
  substrateName,
  substrateType,
  substrateLab,
  predictedLab,
  targetLab,
  conditions,
  qualityTargets,
  onClose,
}: SpecSheetProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const uptake   = estimateDyeUptake(conditions);
  const deltaE   = targetLab
    ? deltaE76(targetLab.l, targetLab.a, targetLab.b, predictedLab.l, predictedLab.a, predictedLab.b)
    : null;

  const hexPredicted = labToHex(predictedLab.l, predictedLab.a, predictedLab.b);
  const hexTarget    = targetLab ? labToHex(targetLab.l, targetLab.a, targetLab.b) : null;
  const hexBase      = substrateLab ? labToHex(substrateLab.l, substrateLab.a, substrateLab.b) : "#C4A882";

  const dateStr = createdAt
    ? new Date(createdAt).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })
    : new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" });

  const handlePrint = () => {
    window.print();
  };

  const enabledTests = QUALITY_TESTS.filter((t) => qualityTargets[t.id]?.enabled);

  return (
    <>
      {/* Print styles injected globally */}
      <style>{`
        @media print {
          body > *:not(#spec-sheet-root) { display: none !important; }
          #spec-sheet-root { position: fixed !important; inset: 0 !important; overflow: visible !important; background: white !important; z-index: 9999 !important; }
          .spec-no-print { display: none !important; }
          .spec-print-page { box-shadow: none !important; border: none !important; margin: 0 !important; padding: 0 !important; page-break-after: always; }
          @page { size: A4; margin: 15mm 18mm; }
        }
      `}</style>

      <div
        id="spec-sheet-root"
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center overflow-y-auto py-8 px-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="w-full max-w-4xl space-y-3">
          {/* Toolbar */}
          <div className="spec-no-print flex items-center gap-2 justify-end">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg"
            >
              <PrinterBoldDuotone size={16} color="currentColor" />
              Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              className="flex items-center gap-2 rounded-xl bg-background/90 border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors shadow"
            >
              <CloseCircleBoldDuotone size={16} color="currentColor" />
              Close
            </button>
          </div>

          {/* ── SPEC SHEET PAGE ─────────────────────────────────────── */}
          <div
            ref={printRef}
            className="spec-print-page bg-white rounded-2xl shadow-2xl overflow-hidden"
            style={{ fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}
          >
            {/* ── Header bar ─────────────────────────────────────────── */}
            <div style={{ background: "oklch(0.32 0.09 255)" }} className="px-8 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {/* Logo mark — three bands */}
                    <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
                      <rect x="2" y="5"  width="24" height="5"   rx="2.5" fill="white" opacity="0.95" />
                      <rect x="4" y="12" width="20" height="4.5" rx="2.2" fill="white" opacity="0.75" />
                      <rect x="7" y="18" width="14" height="4"   rx="2"   fill="white" opacity="0.55" />
                    </svg>
                    <span className="text-white font-bold text-base tracking-tight">TannerySim</span>
                  </div>
                  <p className="text-white/60 text-xs">Leather Recipe Specification</p>
                </div>
                <div className="text-right">
                  {tanneryName && <p className="text-white font-semibold text-sm">{tanneryName}</p>}
                  {refNumber && <p className="text-white/80 text-xs font-mono">Ref: {refNumber}</p>}
                  <p className="text-white/60 text-xs">{dateStr}</p>
                </div>
              </div>
            </div>

            <div className="px-8 py-6 space-y-6">

              {/* ── Recipe name + colour preview ─────────────────────── */}
              <div className="flex items-start gap-6">
                <div className="flex-1">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">Recipe Name</p>
                  <h1 className="text-2xl font-bold text-gray-900">{recipeName}</h1>
                  {substrateName && (
                    <p className="text-sm text-gray-500 mt-1">
                      Substrate: <span className="font-medium text-gray-700">{substrateName}</span>
                      {substrateType && <span className="ml-2 text-gray-400 capitalize">({substrateType})</span>}
                    </p>
                  )}
                </div>
                {/* Colour chips */}
                <div className="flex gap-3 shrink-0">
                  {hexBase && (
                    <div className="text-center">
                      <div
                        className="w-14 h-14 rounded-xl border border-black/10 shadow-sm"
                        style={{ backgroundColor: hexBase }}
                      />
                      <p className="text-[9px] text-gray-400 mt-1 font-medium">BASE</p>
                      <p className="text-[9px] font-mono text-gray-500">{hexBase}</p>
                    </div>
                  )}
                  <div className="text-center">
                    <div
                      className="w-14 h-14 rounded-xl border border-black/10 shadow-sm"
                      style={{ backgroundColor: hexPredicted }}
                    />
                    <p className="text-[9px] text-gray-400 mt-1 font-medium">PREDICTED</p>
                    <p className="text-[9px] font-mono text-gray-500">{hexPredicted}</p>
                  </div>
                  {hexTarget && (
                    <div className="text-center">
                      <div
                        className="w-14 h-14 rounded-xl border border-black/10 shadow-sm"
                        style={{ backgroundColor: hexTarget }}
                      />
                      <p className="text-[9px] text-gray-400 mt-1 font-medium">TARGET</p>
                      <p className="text-[9px] font-mono text-gray-500">{hexTarget}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Colour metrics row ───────────────────────────────── */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "L* (Lightness)", value: predictedLab.l.toFixed(1) },
                  { label: "a* (Red–Green)",  value: predictedLab.a.toFixed(1) },
                  { label: "b* (Yel–Blue)",   value: predictedLab.b.toFixed(1) },
                  { label: "ΔE (CIE76)",       value: deltaE != null ? deltaE.toFixed(2) : "—",
                    sub: deltaE != null
                      ? deltaE < 1 ? "Imperceptible" : deltaE < 3 ? "Acceptable" : deltaE < 6 ? "Noticeable" : "High deviation"
                      : "No target set",
                    color: deltaE != null
                      ? deltaE < 1 ? "#15803D" : deltaE < 3 ? "#D97706" : "#DC2626"
                      : "#6B7280",
                  },
                ].map((m) => (
                  <div key={m.label} className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-center">
                    <p className="text-[9px] text-gray-400 uppercase tracking-wider font-semibold mb-0.5">{m.label}</p>
                    <p className="text-xl font-bold" style={{ color: m.color ?? "#111827" }}>{m.value}</p>
                    {m.sub && <p className="text-[9px] text-gray-500 mt-0.5">{m.sub}</p>}
                  </div>
                ))}
              </div>

              {/* ── Two-column layout: steps + conditions ────────────── */}
              <div className="grid grid-cols-2 gap-6">

                {/* Recipe steps */}
                <div>
                  <SectionHeader>Recipe Steps</SectionHeader>
                  {steps.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No steps defined</p>
                  ) : (
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-1.5 pr-2 font-semibold text-gray-500 text-[10px] uppercase tracking-wide">#</th>
                          <th className="text-left py-1.5 pr-2 font-semibold text-gray-500 text-[10px] uppercase tracking-wide">Chemical</th>
                          <th className="text-right py-1.5 pr-2 font-semibold text-gray-500 text-[10px] uppercase tracking-wide">%</th>
                          <th className="text-right py-1.5 pr-2 font-semibold text-gray-500 text-[10px] uppercase tracking-wide">min</th>
                          <th className="text-right py-1.5 font-semibold text-gray-500 text-[10px] uppercase tracking-wide">°C</th>
                        </tr>
                      </thead>
                      <tbody>
                        {steps.map((s, i) => (
                          <tr key={s.id} className={i % 2 === 0 ? "bg-gray-50/70" : ""}>
                            <td className="py-1.5 pr-2 font-mono text-gray-400">{i + 1}</td>
                            <td className="py-1.5 pr-2 font-medium text-gray-800 leading-tight">{s.chemical_name}</td>
                            <td className="py-1.5 pr-2 text-right font-mono text-gray-700">{s.percentage}</td>
                            <td className="py-1.5 pr-2 text-right font-mono text-gray-700">{s.duration_min}</td>
                            <td className="py-1.5 text-right font-mono text-gray-700">{s.temperature_c}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Process conditions */}
                <div>
                  <SectionHeader>Process Conditions</SectionHeader>
                  <dl className="space-y-1.5">
                    {[
                      ["pH (float end)",      conditions.pH.toFixed(1)],
                      ["Fixation pH",         conditions.fixation_ph.toFixed(1)],
                      ["Temperature",         `${conditions.temperature_c} °C`],
                      ["Float ratio",         `${conditions.float_ratio.toFixed(1)} : 1`],
                      ["Drum speed",          `${conditions.drum_speed_rpm} rpm`],
                      ["Dyeing time",         `${conditions.dyeing_time_min} min`],
                      ["Est. dye uptake",     `${Math.round(uptake * 100)}%`],
                      ["Substrate origin",    SUBSTRATE_ORIGIN_LABELS[conditions.substrate_origin]],
                      ["Tanning system",      TANNING_TYPE_LABELS[conditions.tanning_type]],
                    ].map(([label, val]) => (
                      <div key={label} className="flex justify-between items-baseline gap-2">
                        <dt className="text-[10px] text-gray-500 shrink-0">{label}</dt>
                        <dd className="text-xs font-semibold text-gray-800 text-right font-mono">{val}</dd>
                      </div>
                    ))}
                    {conditions.notes && (
                      <div className="pt-1.5 border-t border-gray-100">
                        <dt className="text-[9px] text-gray-400 uppercase tracking-wide mb-0.5">Notes</dt>
                        <dd className="text-[10px] text-gray-600 leading-snug">{conditions.notes}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>

              {/* ── Quality test targets ─────────────────────────────── */}
              {enabledTests.length > 0 && (
                <div>
                  <SectionHeader>Quality Test Targets</SectionHeader>
                  {QUALITY_CATEGORIES.map((cat) => {
                    const catTests = enabledTests.filter((t) => t.category === cat.id);
                    if (catTests.length === 0) return null;
                    return (
                      <div key={cat.id} className="mb-4">
                        <p
                          className="text-[9px] font-bold uppercase tracking-widest mb-2 pb-1 border-b"
                          style={{ color: cat.color, borderColor: cat.bg }}
                        >
                          {cat.label}
                        </p>
                        <table className="w-full text-[10px] border-collapse">
                          <thead>
                            <tr>
                              <th className="text-left pb-1 pr-3 font-semibold text-gray-400 text-[9px] uppercase tracking-wide w-1/4">Standard</th>
                              <th className="text-left pb-1 pr-3 font-semibold text-gray-400 text-[9px] uppercase tracking-wide">Test</th>
                              <th className="text-right pb-1 pr-3 font-semibold text-gray-400 text-[9px] uppercase tracking-wide">Target</th>
                              <th className="text-right pb-1 pr-3 font-semibold text-gray-400 text-[9px] uppercase tracking-wide">Achieved</th>
                              <th className="text-center pb-1 font-semibold text-gray-400 text-[9px] uppercase tracking-wide">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {catTests.map((test, i) => {
                              const entry    = qualityTargets[test.id];
                              const achieved = entry?.achievedValue;
                              const passing =
                                achieved != null
                                  ? test.higherIsBetter
                                    ? achieved >= (entry?.targetValue ?? test.passValue)
                                    : achieved <= (entry?.targetValue ?? test.passValue)
                                  : null;
                              return (
                                <tr key={test.id} className={i % 2 === 0 ? "bg-gray-50/60" : ""}>
                                  <td className="py-1.5 pr-3 font-mono text-gray-400 text-[9px] align-top">{test.standard}</td>
                                  <td className="py-1.5 pr-3 font-medium text-gray-800 leading-tight">{test.title}</td>
                                  <td className="py-1.5 pr-3 text-right font-mono text-gray-700">{entry?.targetValue ?? test.passValue}</td>
                                  <td className="py-1.5 pr-3 text-right font-mono text-gray-500">
                                    {achieved != null ? achieved : <span className="text-gray-300">—</span>}
                                  </td>
                                  <td className="py-1.5 text-center">
                                    {passing !== null ? (
                                      <span
                                        className="inline-block rounded-full px-2 py-0.5 text-[9px] font-bold"
                                        style={{ backgroundColor: gradeBg(passing), color: gradeColor(passing) }}
                                      >
                                        {passing ? "PASS" : "FAIL"}
                                      </span>
                                    ) : (
                                      <span className="inline-block rounded-full px-2 py-0.5 text-[9px] font-medium bg-gray-100 text-gray-400">
                                        PENDING
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── Approval & sign-off ──────────────────────────────── */}
              <div className="border-t border-gray-200 pt-5">
                <SectionHeader>Approval</SectionHeader>
                <div className="grid grid-cols-3 gap-6 mt-3">
                  {["Prepared by", "Reviewed by", "Approved by"].map((role) => (
                    <div key={role} className="space-y-8">
                      <div className="border-b border-gray-300" />
                      <p className="text-[9px] text-gray-400 uppercase tracking-wider">{role}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                <p className="text-[9px] text-gray-300">Generated by TannerySim · {dateStr}</p>
                <p className="text-[9px] text-gray-300">
                  This document is a simulation output. Physical trials required before production commitment.
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 pb-1.5 border-b border-gray-100">
      {children}
    </h2>
  );
}
