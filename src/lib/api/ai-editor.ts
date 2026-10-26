import { supabase } from "@/lib/supabase";

// Calls Gemini Flash via a Supabase Edge Function.
// The API key is stored as a Supabase Secret — never exposed to the browser.
export async function formatLetterWithAI(content: string): Promise<string> {
  const trimmed = content.trim();
  if (!trimmed) return content;

  const { data, error } = await supabase.functions.invoke<{ text?: string; error?: string }>(
    "gemini-format",
    { body: { content: trimmed } },
  );

  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);

  return data?.text ?? content;
}
