import { supabase, type DbLetterVersion } from "../supabase"
import type { LetterDesignConfig } from "../design-themes"

export async function fetchVersionsByPerson(personId: string): Promise<DbLetterVersion[]> {
  const { data, error } = await supabase
    .from("letter_versions")
    .select("*")
    .eq("person_id", personId)
    .order("created_at", { ascending: false })
  if (error) throw error
  return data
}

export async function saveVersion(
  personId: string,
  letterContent: string,
  designConfig?: LetterDesignConfig,
): Promise<DbLetterVersion> {
  const { data, error } = await supabase
    .from("letter_versions")
    .insert({
      person_id: personId,
      letter_content: letterContent,
      design_config: designConfig ?? null,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteVersion(id: string): Promise<void> {
  const { error } = await supabase.from("letter_versions").delete().eq("id", id)
  if (error) throw error
}
