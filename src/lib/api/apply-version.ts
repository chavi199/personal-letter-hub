import { supabase } from "../supabase"

export interface ApplyResult {
  personId: string
  personName: string
  success: boolean
  error?: string
}

export async function applyVersionToPeople(
  letterContent: string,
  targets: { id: string; name: string }[],
): Promise<ApplyResult[]> {
  const results: ApplyResult[] = []

  for (const person of targets) {
    try {
      const { error } = await supabase
        .from("letter_versions")
        .insert({ person_id: person.id, letter_content: letterContent })

      results.push({ personId: person.id, personName: person.name, success: !error, error: error?.message })
    } catch (e) {
      results.push({ personId: person.id, personName: person.name, success: false, error: (e as Error).message })
    }
  }

  return results
}
