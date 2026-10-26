import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const SYSTEM_PROMPT =
  "You are a language formatting assistant. Improve the readability of the letter by fixing spelling, punctuation, paragraph structure, line breaks, and removing unnecessary spaces. Never change the meaning, tone, style, or content. Return ONLY the formatted letter text — no explanations, no commentary.";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    const { content } = await req.json() as { content?: string };

    if (!content?.trim()) {
      return json({ error: "content is required" }, 400);
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) return json({ error: "GEMINI_API_KEY secret not configured" }, 500);

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ parts: [{ text: content.trim() }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 4096 },
        }),
      },
    );

    const data = await geminiRes.json() as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
      error?: { message?: string };
    };

    if (!geminiRes.ok) {
      return json({ error: data.error?.message ?? `Gemini error ${geminiRes.status}` }, geminiRes.status);
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? content;
    return json({ text });
  } catch (e) {
    return json({ error: (e as Error).message ?? "Unexpected error" }, 500);
  }
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}
