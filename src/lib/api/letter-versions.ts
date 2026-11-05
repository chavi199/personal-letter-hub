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

/** Lightweight check for onboarding checklist — any saved version for the current user. */
export async function hasAnyLetterVersion(): Promise<boolean> {
  const { count, error } = await supabase
    .from("letter_versions")
    .select("id", { count: "exact", head: true })
    .limit(1)
  if (error) throw error
  return (count ?? 0) > 0
}

export async function fetchVersionsForPeople(personIds: string[]): Promise<Map<string, DbLetterVersion[]>> {
  const map = new Map<string, DbLetterVersion[]>()
  if (personIds.length === 0) return map
  const { data, error } = await supabase
    .from("letter_versions")
    .select("*")
    .in("person_id", personIds)
    .order("created_at", { ascending: false })
  if (error) throw error
  for (const row of data ?? []) {
    const list = map.get(row.person_id) ?? []
    list.push(row)
    map.set(row.person_id, list)
  }
  return map
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

export async function updateVersionDesign(
  id: string,
  designConfig: LetterDesignConfig,
): Promise<void> {
  const { error } = await supabase
    .from("letter_versions")
    .update({ design_config: designConfig })
    .eq("id", id)
  if (error) throw error
}
