import { supabase, type DbLetterShareLink } from "../supabase"
import type { LetterDesignConfig } from "../design-themes"

export type PublicSharedLetter =
  | {
      is_active: true
      recipient_name: string
      letter_content: string
      design_config: LetterDesignConfig | null
      updated_at: string
    }
  | {
      is_active: false
    }

function createShareToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  let binary = ""
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "")
}

export function buildShareUrl(token: string): string {
  if (typeof window === "undefined") return `/share/${token}`
  return `${window.location.origin}/share/${token}`
}

export async function fetchActiveShareLink(personId: string): Promise<DbLetterShareLink | null> {
  const { data, error } = await supabase
    .from("letter_share_links")
    .select("*")
    .eq("person_id", personId)
    .eq("is_active", true)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function createOrRefreshShareLink(input: {
  personId: string
  recipientName: string
  letterContent: string
  designConfig?: LetterDesignConfig | null
}): Promise<DbLetterShareLink> {
  const existing = await fetchActiveShareLink(input.personId)
  if (existing) {
    const { data, error } = await supabase
      .from("letter_share_links")
      .update({
        recipient_name: input.recipientName,
        letter_content: input.letterContent,
        design_config: input.designConfig ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select()
      .single()
    if (error) throw error
    return data
  }

  const { data, error } = await supabase
    .from("letter_share_links")
    .insert({
      person_id: input.personId,
      token: createShareToken(),
      is_active: true,
      recipient_name: input.recipientName,
      letter_content: input.letterContent,
      design_config: input.designConfig ?? null,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function rotateShareLink(input: {
  personId: string
  recipientName: string
  letterContent: string
  designConfig?: LetterDesignConfig | null
}): Promise<DbLetterShareLink> {
  const existing = await fetchActiveShareLink(input.personId)
  if (existing) {
    const { error: revokeError } = await supabase
      .from("letter_share_links")
      .update({
        is_active: false,
        revoked_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
    if (revokeError) throw revokeError
  }

  const { data, error } = await supabase
    .from("letter_share_links")
    .insert({
      person_id: input.personId,
      token: createShareToken(),
      is_active: true,
      recipient_name: input.recipientName,
      letter_content: input.letterContent,
      design_config: input.designConfig ?? null,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function revokeShareLink(personId: string): Promise<void> {
  const existing = await fetchActiveShareLink(personId)
  if (!existing) return
  const { error } = await supabase
    .from("letter_share_links")
    .update({
      is_active: false,
      revoked_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", existing.id)
  if (error) throw error
}

export async function fetchSharedLetterByToken(token: string): Promise<PublicSharedLetter> {
  const { data, error } = await supabase.rpc("get_shared_letter", { p_token: token })
  if (error) throw error
  if (!data || typeof data !== "object") return { is_active: false }

  const row = data as Record<string, unknown>
  if (row.is_active !== true) return { is_active: false }

  return {
    is_active: true,
    recipient_name: typeof row.recipient_name === "string" ? row.recipient_name : "",
    letter_content: typeof row.letter_content === "string" ? row.letter_content : "",
    design_config: (row.design_config as LetterDesignConfig | null) ?? null,
    updated_at: typeof row.updated_at === "string" ? row.updated_at : "",
  }
}
