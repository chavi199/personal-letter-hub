import { supabase, type DbPerson, type LetterStatus } from "../supabase"

export async function fetchPeopleByGroup(groupId: string): Promise<DbPerson[]> {
  const { data, error } = await supabase
    .from("people")
    .select("*")
    .eq("group_id", groupId)
    .order("created_at", { ascending: true })
  if (error) throw error
  return data
}

export async function fetchPersonById(id: string): Promise<DbPerson> {
  const { data, error } = await supabase
    .from("people")
    .select("*")
    .eq("id", id)
    .single()
  if (error) throw error
  return data
}

export async function createPerson(groupId: string, name: string): Promise<DbPerson> {
  const { data, error } = await supabase
    .from("people")
    .insert({ group_id: groupId, name })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function importPeople(
  groupId: string,
  names: string[],
): Promise<DbPerson[]> {
  const rows = names.map((name) => ({ group_id: groupId, name: name.trim() }))
  const { data, error } = await supabase
    .from("people")
    .insert(rows)
    .select()
  if (error) throw error
  return data
}

export async function updatePerson(
  id: string,
  fields: Partial<Omit<DbPerson, "id" | "group_id" | "user_id" | "created_at">>,
): Promise<DbPerson> {
  const { data, error } = await supabase
    .from("people")
    .update(fields)
    .eq("id", id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateLetterStatus(
  id: string,
  status: LetterStatus,
): Promise<void> {
  const { error } = await supabase
    .from("people")
    .update({ status })
    .eq("id", id)
  if (error) throw error
}

export async function deletePerson(id: string): Promise<void> {
  const { error } = await supabase.from("people").delete().eq("id", id)
  if (error) throw error
}

// fetch all people across all groups — RLS ensures only current user's groups
export async function fetchAllPeople(): Promise<DbPerson[]> {
  const { data, error } = await supabase
    .from("people")
    .select("*")
  if (error) throw error
  return data
}
