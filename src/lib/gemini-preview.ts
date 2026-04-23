/**
 * Gemini / Imagen 3 swatch preview generator.
 *
 * Two-step approach (fully programmatic, no text-LLM call):
 *   1. buildLeatherPrompt()  — deterministically converts recipe state → rich visual description
 *   2. generateSwatchImage() — sends that prompt to Imagen 3 and returns a base64 PNG data URL
 */

import type { ProcessConditions, SubstrateOrigin, TanningType } from "@/lib/process-conditions";
import type { RecipeStep } from "@/components/recipe/RecipeStepEditor";

/* ── Lab* → approximate colour name ──────────────────────────────────── */

interface NamedColor {
  name: string;
  l: number; a: number; b: number;
}

const NAMED_COLORS: NamedColor[] = [
  { name: "jet black",              l:  8, a:  0, b:  0 },
  { name: "near-black charcoal",    l: 16, a:  0, b: -1 },
  { name: "deep charcoal grey",     l: 24, a:  0, b:  0 },
  { name: "dark navy blue",         l: 20, a:  2, b:-18 },
  { name: "deep burgundy",          l: 24, a: 26, b:  8 },
  { name: "dark forest green",      l: 25, a:-16, b: 10 },
  { name: "dark brown",             l: 28, a:  9, b: 14 },
  { name: "medium charcoal",        l: 34, a:  0, b:  0 },
  { name: "deep cobalt blue",       l: 30, a:  4, b:-28 },
  { name: "deep russet red",        l: 33, a: 30, b: 20 },
  { name: "medium brown",           l: 38, a:  9, b: 18 },
  { name: "warm cognac",            l: 44, a: 15, b: 25 },
  { name: "rich olive green",       l: 46, a: -5, b: 16 },
  { name: "warm caramel",           l: 52, a: 14, b: 36 },
  { name: "medium tan",             l: 56, a: 10, b: 28 },
  { name: "warm mustard yellow",    l: 66, a:  7, b: 42 },
  { name: "light beige tan",        l: 72, a:  4, b: 18 },
  { name: "pale ivory",             l: 84, a:  1, b: 10 },
  { name: "off-white natural",      l: 90, a:  0, b:  6 },
  { name: "bright white",           l: 96, a:  0, b:  2 },
];

function labToColorName(l: number, a: number, b: number): string {
  let best = NAMED_COLORS[0];
  let bestDist = Infinity;
  for (const c of NAMED_COLORS) {
    const d = Math.sqrt((l - c.l) ** 2 + (a - c.a) ** 2 + (b - c.b) ** 2);
    if (d < bestDist) { bestDist = d; best = c; }
  }
  return best.name;
}

/* ── Descriptor maps ─────────────────────────────────────────────────── */

const GRAIN_DESCRIPTIONS: Record<SubstrateOrigin, string> = {
  cattle_eu:            "medium full-grain bovine texture with natural growth marks and subtle tick scars",
  cattle_south_america: "full-grain South American bovine hide with open pore structure and bold natural marks",
  cattle_us:            "clean full-grain US bovine leather with tight, even pore pattern",
  cattle_india:         "full-grain Indian bovine hide with pronounced growth marks and open grain",
  cattle_australia:     "fine full-grain Australian bovine leather with tight, consistent pore pattern",
  buffalo:              "coarse, bold-grain buffalo hide with deep ridges and prominent follicle channels",
  pigskin:              "fine-grained pigskin with characteristic triangular follicle clusters",
  sheepskin:            "smooth, fine-grained sheepskin with almost pore-less surface",
  goatskin:             "tight, fine-grained goatskin with subtle wave-like grain pattern",
  lambskin:             "ultra-fine, silky-smooth lambskin with barely visible grain structure",
  deer:                 "soft, velvety deer leather with fine, irregular grain pattern",
  exotic:               "exotic leather with highly distinctive scale or pattern texture",
};

const TANNING_DESCRIPTIONS: Record<TanningType, string> = {
  chrome:      "chrome-tanned, producing a smooth uniform surface with consistent colour penetration and slight gloss",
  vegetable:   "vegetable-tanned with natural pull-up character, waxy surface sheen, and warm highlights on grain peaks",
  synthetic:   "synthetically tanned with a very uniform, engineered surface and consistent colour distribution",
  wet_white:   "wet-white tanned, pale clean base with soft surface and moderate colour acceptance",
  aldehyde:    "aldehyde-tanned producing a supple, washable surface with warm undertones",
  combination: "combination-tanned offering balanced structure with medium grain definition and good colour depth",
};

/* ── Prompt builder ──────────────────────────────────────────────────── */

export interface PromptState {
  predictedLab: { l: number; a: number; b: number };
  conditions: ProcessConditions;
  steps: RecipeStep[];
  uptakeFactor: number; // 0–1
  substrateName?: string;
}

function describePenetration(uptake: number): string {
  if (uptake >= 0.75) return "deeply saturated, perfectly level colour penetration throughout the cross-section";
  if (uptake >= 0.50) return "moderately penetrated dye with warm substrate undertones still visible";
  if (uptake >= 0.30) return "surface-applied colour wash with significant substrate warmth showing through";
  return "very light surface tint, substrate character dominates";
}

function describeLevelness(fixPh: number): string {
  if (fixPh >= 3.2 && fixPh <= 4.2) return "perfectly level, streak-free fixation";
  if (fixPh < 3.2) return "aggressive acid drop fixation with risk of unlevel streaking";
  return "high-pH fixation, slightly unlevel with possible shading variation";
}

function hasCategoryStep(steps: RecipeStep[], categories: string[]): boolean {
  // Check step chemical_name for category hints (fatliquor names, syntan names)
  const fatKeywords = ["fatliquor", "lipoderm", "melio", "densodrin", "lipsol", "truposol", "oil", "fat"];
  const retanKeywords = ["syntan", "retanal", "relugan", "sellatan", "chromosal", "tanigan", "retan"];
  return steps.some((s) => {
    const name = s.chemical_name.toLowerCase();
    return categories.some((kw) => name.includes(kw));
  });
}

export function buildLeatherPrompt(
  state: PromptState,
  variant: "swatch-front" | "swatch-back",
): string {
  const { predictedLab, conditions, steps, uptakeFactor } = state;
  const { l, a, b } = predictedLab;

  const colorName   = labToColorName(l, a, b);
  const grain       = GRAIN_DESCRIPTIONS[conditions.substrate_origin];
  const tanningChar = TANNING_DESCRIPTIONS[conditions.tanning_type];
  const penetration = describePenetration(uptakeFactor);
  const levelness   = describeLevelness(conditions.fixation_ph);
  const hasFat      = hasCategoryStep(steps, ["fatliquor", "lipoderm", "melio", "densodrin", "lipsol", "truposol", "oil", "fat"]);
  const hasSyntan   = hasCategoryStep(steps, ["syntan", "retanal", "relugan", "sellatan", "chromosal", "tanigan", "retan"]);

  const variantDesc = variant === "swatch-front"
    ? "grain side facing directly toward camera, full-face flat lay view"
    : "flesh side (reverse) facing camera, showing fibrous split structure and suede-like texture";

  const extras: string[] = [];
  if (hasFat) extras.push("soft, supple hand with well-lubricated drape");
  if (hasSyntan) extras.push("firm, structured body with clean break");
  if (conditions.tanning_type === "vegetable") extras.push("warm amber pull-up highlights where grain peaks catch the light");

  const extraLine = extras.length > 0 ? `Feel and character: ${extras.join("; ")}.` : "";

  return `Ultra-realistic studio macro photograph of a single leather swatch, ${variantDesc}.
Colour: ${colorName} (CIE Lab L*=${l.toFixed(1)} a*=${a.toFixed(1)} b*=${b.toFixed(1)}).
Grain: ${grain}.
Tanning: ${tanningChar}.
Dyeing: ${penetration}. ${levelness}.
${extraLine}
Shot on a pure white seamless background, professional product photography lighting with a key light at 45 degrees and a soft fill reflector. Hyper-realistic, ultra-detailed, 8K resolution, macro lens, photorealistic leather material. No text, no labels, no watermarks, no props, no hands. Perfect square 1:1 crop.`.trim();
}

/* ── Imagen 3 API client ─────────────────────────────────────────────── */

const IMAGEN_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict";

const NEGATIVE_PROMPT =
  "cartoon, illustration, drawing, painting, sketch, 3D render, CGI, logo, watermark, text, label, person, hand, background clutter, shadow on background, coloured background, multiple swatches";

export interface GenerateResult {
  imageDataUrl: string; // "data:image/png;base64,..."
  prompt: string;
}

export async function generateSwatchImage(
  apiKey: string,
  prompt: string,
): Promise<GenerateResult> {
  const res = await fetch(`${IMAGEN_ENDPOINT}?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: {
        sampleCount: 1,
        aspectRatio: "1:1",
        negativePrompt: NEGATIVE_PROMPT,
        safetyFilterLevel: "block_few",
        personGeneration: "dont_allow",
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: res.statusText } }));
    throw new Error(err?.error?.message ?? `Imagen 3 error ${res.status}`);
  }

  const json = await res.json();
  const b64: string | undefined = json?.predictions?.[0]?.bytesBase64Encoded;
  if (!b64) throw new Error("Imagen 3 returned no image data");

  return {
    imageDataUrl: `data:image/png;base64,${b64}`,
    prompt,
  };
}
