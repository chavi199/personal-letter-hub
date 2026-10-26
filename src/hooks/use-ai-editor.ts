import { useState } from "react";
import { toast } from "sonner";
import { formatLetterWithAI } from "@/lib/api/ai-editor";

type AiEditorState = "idle" | "loading" | "review";

export function useAiEditor() {
  const [state, setState] = useState<AiEditorState>("idle");
  const [formatted, setFormatted] = useState("");

  async function run(content: string) {
    setState("loading");
    try {
      const result = await formatLetterWithAI(content);
      setFormatted(result);
      setState("review");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "שגיאת AI — נסה שוב");
      setState("idle");
    }
  }

  function reset() {
    setState("idle");
    setFormatted("");
  }

  return { state, formatted, run, reset };
}
