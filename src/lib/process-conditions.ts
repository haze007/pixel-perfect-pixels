/**
 * Process conditions applied during leather dyeing/finishing.
 * These parameters influence real-world colour outcome and quality test performance.
 */

export interface ProcessConditions {
  /** pH of the float at the end of dyeing (typically 3.5–6.5) */
  pH: number;
  /** Float temperature in °C (typically 40–70°C for dyeing) */
  temperature_c: number;
  /** Float ratio — kg water per kg leather (0.5:1 to 10:1) */
  float_ratio: number;
  /** Drum rotation speed in rpm (2–18) */
  drum_speed_rpm: number;
  /** Duration of main dyeing step in minutes */
  dyeing_time_min: number;
  /** Fixation pH (typically 3.0–4.5 after acid drop) */
  fixation_ph: number;
  /** Substrate (hide) origin */
  substrate_origin: SubstrateOrigin;
  /** Tanning system used on the substrate */
  tanning_type: TanningType;
  /** Notes / free text for this trial */
  notes: string;
}

export type SubstrateOrigin =
  | "cattle_eu"
  | "cattle_south_america"
  | "cattle_us"
  | "cattle_india"
  | "cattle_australia"
  | "buffalo"
  | "pigskin"
  | "sheepskin"
  | "goatskin"
  | "lambskin"
  | "deer"
  | "exotic";

export type TanningType =
  | "chrome"
  | "vegetable"
  | "synthetic"
  | "wet_white"
  | "aldehyde"
  | "combination";

export const SUBSTRATE_ORIGIN_LABELS: Record<SubstrateOrigin, string> = {
  cattle_eu:             "Cattle — EU",
  cattle_south_america:  "Cattle — South America",
  cattle_us:             "Cattle — US",
  cattle_india:          "Cattle — India",
  cattle_australia:      "Cattle — Australia",
  buffalo:               "Buffalo",
  pigskin:               "Pigskin",
  sheepskin:             "Sheepskin",
  goatskin:              "Goatskin",
  lambskin:              "Lambskin",
  deer:                  "Deer",
  exotic:                "Exotic (specify in notes)",
};

export const TANNING_TYPE_LABELS: Record<TanningType, string> = {
  chrome:      "Chrome-tanned (Cr₂O₃)",
  vegetable:   "Vegetable-tanned",
  synthetic:   "Synthetic (syntan-only)",
  wet_white:   "Wet-white (glutaraldehyde/syntan)",
  aldehyde:    "Aldehyde-tanned",
  combination: "Combination-tanned",
};

export const DEFAULT_CONDITIONS: ProcessConditions = {
  pH:              4.0,
  temperature_c:   60,
  float_ratio:     2.0,
  drum_speed_rpm:  8,
  dyeing_time_min: 60,
  fixation_ph:     3.5,
  substrate_origin: "cattle_eu",
  tanning_type:     "chrome",
  notes: "",
};

/**
 * Estimate the impact modifier on colour absorption based on conditions.
 * Higher value (0–1) = better dye uptake expected.
 */
export function estimateDyeUptake(cond: ProcessConditions): number {
  // pH 3.5–4.5 is optimal for acid dyes on chrome leather
  const pHFactor = Math.max(0, 1 - Math.abs(cond.pH - 4.0) / 2.5);
  // Temp 50–65°C is optimal
  const tempFactor = Math.max(0, 1 - Math.abs(cond.temperature_c - 57.5) / 30);
  // Float 1:1–2:1 is optimal (lower float = more concentrated)
  const floatFactor = Math.max(0, 1 - (cond.float_ratio - 1.5) / 6);
  // Time: longer time generally better up to ~90min
  const timeFactor = Math.min(1, cond.dyeing_time_min / 90);
  return (pHFactor * 0.35 + tempFactor * 0.25 + floatFactor * 0.2 + timeFactor * 0.2);
}

/* ── PBR material profile ─────────────────────────────────────────── */

/**
 * Physical rendering properties that vary with leather type.
 * All values are targets — the 3D material lerps toward them each frame.
 */
export interface LeatherProfile {
  roughness: number;          // 0.55 – 0.90
  normalScale: number;        // 0.25 – 0.80  (grain prominence)
  sheen: number;              // 0.10 – 0.60  (organic surface shimmer)
  sheenRoughness: number;     // 0.45 – 0.85
  clearcoat: number;          // 0.00 – 0.15  (protected/finished surface)
  clearcoatRoughness: number; // 0.50 – 0.95
  aoIntensity: number;        // 0.5  – 1.2   (shadow depth in grain)
}

const BASE_PROFILES: Record<TanningType, LeatherProfile> = {
  chrome: {
    roughness: 0.72, normalScale: 0.55, sheen: 0.35, sheenRoughness: 0.65,
    clearcoat: 0.04, clearcoatRoughness: 0.70, aoIntensity: 0.80,
  },
  vegetable: {
    // Full-grain veg: waxy pull-up, pronounced grain, very matte
    roughness: 0.85, normalScale: 0.72, sheen: 0.50, sheenRoughness: 0.50,
    clearcoat: 0.00, clearcoatRoughness: 0.90, aoIntensity: 1.10,
  },
  synthetic: {
    // Syntan-only: very uniform, low grain, slightly cold surface
    roughness: 0.66, normalScale: 0.38, sheen: 0.18, sheenRoughness: 0.72,
    clearcoat: 0.08, clearcoatRoughness: 0.62, aoIntensity: 0.60,
  },
  wet_white: {
    // Pale, relatively smooth, low sheen
    roughness: 0.76, normalScale: 0.44, sheen: 0.22, sheenRoughness: 0.78,
    clearcoat: 0.05, clearcoatRoughness: 0.80, aoIntensity: 0.70,
  },
  aldehyde: {
    // Washable chamois-like; soft, matte, warm
    roughness: 0.82, normalScale: 0.48, sheen: 0.28, sheenRoughness: 0.80,
    clearcoat: 0.02, clearcoatRoughness: 0.88, aoIntensity: 0.90,
  },
  combination: {
    roughness: 0.74, normalScale: 0.55, sheen: 0.30, sheenRoughness: 0.68,
    clearcoat: 0.04, clearcoatRoughness: 0.74, aoIntensity: 0.82,
  },
};

/** Additive delta applied on top of the tanning profile per substrate origin. */
const ORIGIN_DELTAS: Partial<Record<SubstrateOrigin, Partial<LeatherProfile>>> = {
  lambskin:  { roughness: -0.10, normalScale: -0.22, sheen: +0.08, aoIntensity: -0.20 },
  sheepskin: { roughness: -0.08, normalScale: -0.18, sheen: +0.05, aoIntensity: -0.15 },
  goatskin:  { roughness: -0.04, normalScale: -0.08, sheen: +0.03, aoIntensity: -0.05 },
  pigskin:   { roughness: +0.06, normalScale: +0.18, sheen: -0.06, aoIntensity: +0.15 },
  buffalo:   { roughness: +0.08, normalScale: +0.12, sheen: -0.04, aoIntensity: +0.12 },
  exotic:    { roughness: -0.12, normalScale: +0.30, sheen: +0.12, aoIntensity: +0.20 },
};

function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }

/**
 * Derive a complete PBR LeatherProfile from tanning type + substrate origin.
 * Used to drive the 3D viewer material in real time.
 */
export function getLeatherProfile(cond: ProcessConditions): LeatherProfile {
  const base  = { ...BASE_PROFILES[cond.tanning_type] };
  const delta = ORIGIN_DELTAS[cond.substrate_origin] ?? {};

  return {
    roughness:          clamp((base.roughness         + (delta.roughness         ?? 0)), 0.40, 0.95),
    normalScale:        clamp((base.normalScale        + (delta.normalScale        ?? 0)), 0.20, 0.90),
    sheen:              clamp((base.sheen              + (delta.sheen              ?? 0)), 0.05, 0.70),
    sheenRoughness:     clamp((base.sheenRoughness     + (delta.sheenRoughness     ?? 0)), 0.40, 0.90),
    clearcoat:          clamp((base.clearcoat          + (delta.clearcoat          ?? 0)), 0.00, 0.18),
    clearcoatRoughness: clamp((base.clearcoatRoughness + (delta.clearcoatRoughness ?? 0)), 0.45, 0.98),
    aoIntensity:        clamp((base.aoIntensity        + (delta.aoIntensity        ?? 0)), 0.40, 1.30),
  };
}
