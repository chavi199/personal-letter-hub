import { supabase, type DbContentItem } from "../supabase"

type ContentType = "opening" | "compliment" | "closing"

export async function fetchContentItems(type: ContentType): Promise<DbContentItem[]> {
  const { data, error } = await supabase
    .from("content_items")
    .select("*")
    .eq("type", type)
    .order("created_at", { ascending: true })
  if (error) throw error
  return data
}

export async function fetchAllContentItems(): Promise<DbContentItem[]> {
  const { data, error } = await supabase
    .from("content_items")
    .select("*")
    .order("type", { ascending: true })
  if (error) throw error
  return data
}

export async function createContentItem(
  type: ContentType,
  content: string,
  category?: string,
): Promise<DbContentItem> {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from("content_items")
    .insert({ type, content, category: category ?? null, user_id: user!.id })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function importContentItems(
  type: ContentType,
  items: Array<{ content: string; category?: string }>,
): Promise<DbContentItem[]> {
  const { data: { user } } = await supabase.auth.getUser()
  const rows = items.map((item) => ({
    type,
    content: item.content.trim(),
    category: item.category ?? null,
    user_id: user!.id,
  }))
  const { data, error } = await supabase
    .from("content_items")
    .insert(rows)
    .select()
  if (error) throw error
  return data
}

export async function updateContentItem(
  id: string,
  content: string,
  category?: string,
): Promise<DbContentItem> {
  const { data, error } = await supabase
    .from("content_items")
    .update({ content, category: category ?? null })
    .eq("id", id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteContentItem(id: string): Promise<void> {
  const { error } = await supabase.from("content_items").delete().eq("id", id)
  if (error) throw error
}
