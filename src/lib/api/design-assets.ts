import { supabase } from "../supabase"

const BUCKET = "letter-design-assets"

export async function uploadDesignAsset(
  file: File,
  type: "logo" | "background",
): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const ext = file.name.split(".").pop() ?? "png"
  const path = `${user.id}/${type}s/${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage.from(BUCKET).upload(path, file)
  if (error) throw error

  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}

export async function deleteDesignAsset(publicUrl: string): Promise<void> {
  const marker = `/${BUCKET}/`
  const idx = publicUrl.indexOf(marker)
  if (idx === -1) return
  const path = publicUrl.slice(idx + marker.length)
  await supabase.storage.from(BUCKET).remove([path])
}
