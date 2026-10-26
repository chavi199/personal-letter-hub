import { createClient } from "@supabase/supabase-js"
import type { LetterDesignConfig } from "./design-themes"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local",
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ---- Types ----

export type LetterStatus = "not_started" | "draft" | "completed"

export interface DbGroup {
  id: string
  user_id: string
  name: string
  created_at: string
}

export interface DbPerson {
  id: string
  group_id: string
  name: string
  status: LetterStatus
  letter_content: string
  personal_notes: string
  personal_ideas: string
  personal_traits: string
  personal_info: string
  created_at: string
}

export interface DbLetterVersion {
  id: string
  person_id: string
  user_id: string
  label: string | null
  letter_content: string
  design_config: LetterDesignConfig | null
  created_at: string
}

export interface DbContentItem {
  id: string
  user_id: string
  type: "opening" | "compliment" | "closing"
  content: string
  category: string | null
  created_at: string
}
