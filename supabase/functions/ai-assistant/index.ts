import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LOVABLE_API_URL = "https://ai-gateway.lovable.dev/v1/chat/completions";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not set");

    const { messages, context } = await req.json();

    const systemPrompt = `You are TannerySim AI, an expert leather chemistry assistant.
You help tannery operators formulate and optimize leather finishing recipes.

Context about the user's chemicals and substrates:
${context || "No context provided."}

Guidelines:
- Suggest specific chemicals by name when available in the user's catalogue
- Provide LAB color predictions when possible
- Recommend step sequences with percentages, temperatures, and durations
- Explain the chemistry behind your suggestions
- When asked about color matching, discuss delta-E values
- Keep responses concise and actionable
- Format recipes as numbered steps`;

    const response = await fetch(LOVABLE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
