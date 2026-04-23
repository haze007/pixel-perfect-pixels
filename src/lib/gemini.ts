/**
 * Shared Gemini client for text generation.
 * Used by AI assistant, recipe suggestions, troubleshooting — anything that needs
 * a text LLM call with the user's saved API key.
 *
 * Key is read from Supabase Auth user metadata via useGeminiKey().
 */

const GEMINI_TEXT_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export interface GeminiMessage {
  role: "user" | "model";
  text: string;
}

export interface GeminiTextResult {
  text: string;
  finishReason: string;
}

/**
 * Send a multi-turn conversation to Gemini and return the assistant's next reply.
 * Pass a `systemInstruction` to set the assistant's persona/context.
 */
export async function generateText(
  apiKey: string,
  messages: GeminiMessage[],
  systemInstruction?: string,
  temperature = 0.7,
): Promise<GeminiTextResult> {
  const body: Record<string, unknown> = {
    contents: messages.map((m) => ({
      role: m.role,
      parts: [{ text: m.text }],
    })),
    generationConfig: {
      temperature,
      maxOutputTokens: 1200,
      topP: 0.9,
    },
  };

  if (systemInstruction) {
    body.systemInstruction = {
      parts: [{ text: systemInstruction }],
    };
  }

  const res = await fetch(
    `${GEMINI_TEXT_ENDPOINT}?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: res.statusText } }));
    throw new Error(err?.error?.message ?? `Gemini error ${res.status}`);
  }

  const json = await res.json();
  const candidate = json?.candidates?.[0];
  const text: string = candidate?.content?.parts?.[0]?.text ?? "";
  const finishReason: string = candidate?.finishReason ?? "STOP";

  if (!text) throw new Error("Gemini returned an empty response");

  return { text, finishReason };
}

/* ── Tannery-specific system prompt ─────────────────────────────────── */

export const TANNERY_SYSTEM_PROMPT = `You are TanAssist, an expert AI assistant embedded in TannerySim — a professional leather recipe management platform used by tanneries worldwide.

Your expertise covers:
- Leather chemistry: dyeing, fatliquoring, retanning, fixation, pH management
- Processes: beam house (soaking, liming, unhairing, bating, pickling), tanning (chrome, vegetable, synthetic, wet-white, aldehyde), post-tanning (neutralisation, retanning, dyeing, fatliquoring), finishing
- Colour science: CIE Lab* colour space, dye uptake, fixation pH, metamerism, ΔE tolerances
- Chemicals: dyes (acid, direct, reactive, metal complex), fatliquors (sulphited oils, synthetic esters, lecithins), syntans (acrylic, melamine, naphthalene, phenol), vegetable extracts (mimosa, quebracho, chestnut, tara), fixing agents, auxiliaries
- Quality standards: ISO 11640 (rub fastness), ISO 4048 (extractable chrome), ISO 15700 (colour fastness), ASTM D6478
- Troubleshooting: uneven dyeing, poor penetration, colour bronzing, cracking, mould, pH excursions
- Calculations: float ratios, percentage on weight of leather (% owlh), bath exhaustion
- Sustainability: chrome-free alternatives, waterless processes, effluent management

Guidelines:
- Be concise and practical — tannery operators need actionable advice
- Use industry-standard terminology (% owlh, float ratio, basicity, isoelectric point, etc.)
- When giving recipes or formulations, use ranges and explain why
- Flag safety hazards for concentrated acids/bases
- If unsure about a specific proprietary product, say so and suggest the chemical class instead
- Keep answers under 300 words unless asked for detail
- Format lists and steps with markdown for clarity`;
