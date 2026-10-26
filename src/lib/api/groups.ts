import { supabase, type DbGroup } from "../supabase"

export async function fetchGroups(): Promise<DbGroup[]> {
  const { data, error } = await supabase
    .from("groups")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) throw error
  return data
}

export async function fetchGroupById(id: string): Promise<DbGroup> {
  const { data, error } = await supabase
    .from("groups")
    .select("*")
    .eq("id", id)
    .single()
  if (error) throw error
  return data
}

export async function createGroup(name: string): Promise<DbGroup> {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from("groups")
    .insert({ name, user_id: user!.id })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateGroup(id: string, name: string): Promise<DbGroup> {
  const { data, error } = await supabase
    .from("groups")
    .update({ name })
    .eq("id", id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteGroup(id: string): Promise<void> {
  const { error } = await supabase.from("groups").delete().eq("id", id)
  if (error) throw error
}
