import { createServerFn } from "@tanstack/react-start"
import { createClient } from "@supabase/supabase-js"

const MAX_RECIPIENTS = 8
const MAX_PDF_CHARS = 7_000_000
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type SendLetterInput = {
  accessToken: string
  to: string[]
  personName: string
  pdfBase64: string
}

function readEnv(name: string): string | undefined {
  return (process.env as Record<string, string | undefined>)[name]
}

function cleanBase64(value: string): string {
  const comma = value.indexOf(",")
  return (comma >= 0 ? value.slice(comma + 1) : value).replace(/\s/g, "")
}

function parseInput(input: unknown): SendLetterInput {
  const data = input as Partial<SendLetterInput> | null
  const accessToken = typeof data?.accessToken === "string" ? data.accessToken.trim() : ""
  if (!accessToken) throw new Error("צריך להתחבר לפני שליחה")

  const to = Array.isArray(data?.to)
    ? [...new Set(data.to.map((item) => String(item).trim().toLowerCase()).filter(Boolean))]
    : []
  if (to.length === 0) throw new Error("חסרה כתובת מייל")
  if (to.length > MAX_RECIPIENTS) throw new Error(`אפשר לשלוח עד ${MAX_RECIPIENTS} כתובות בבת אחת`)
  if (to.some((email) => !EMAIL_PATTERN.test(email))) throw new Error("אחת מכתובות המייל לא תקינה")

  const personName = (typeof data?.personName === "string" ? data.personName : "מכתב")
    .replace(/[\r\n]/g, " ")
    .trim()
    .slice(0, 120) || "מכתב"

  const pdfBase64 = cleanBase64(typeof data?.pdfBase64 === "string" ? data.pdfBase64 : "")
  if (!pdfBase64) throw new Error("קובץ ה-PDF ריק")
  if (pdfBase64.length > MAX_PDF_CHARS) throw new Error("הקובץ גדול מדי לשליחה")

  return { accessToken, to, personName, pdfBase64 }
}

async function assertSignedIn(accessToken: string) {
  const url = import.meta.env.VITE_SUPABASE_URL || readEnv("VITE_SUPABASE_URL")
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || readEnv("VITE_SUPABASE_ANON_KEY")
  if (!url || !key) throw new Error("חסר חיבור למערכת")

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data, error } = await supabase.auth.getUser(accessToken)
  if (error || !data.user) throw new Error("צריך להתחבר לפני שליחה")
}

export const sendLetterEmail = createServerFn({ method: "POST" })
  .validator(parseInput)
  .handler(async ({ data }) => {
    await assertSignedIn(data.accessToken)

    const apiKey = readEnv("RESEND_API_KEY")
    const from = readEnv("RESEND_FROM")
    if (!apiKey || !from) {
      throw new Error("שליחת המייל עדיין לא הוגדרה בשרת. צריך RESEND_API_KEY ו-RESEND_FROM ב-Vercel")
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: data.to,
        subject: `מכתב ל${data.personName}`,
        html: `<div dir="rtl" style="font-family:Arial,sans-serif"><p>מצורף מכתב עבור ${escapeHtml(data.personName)}.</p></div>`,
        attachments: [
          {
            filename: "letter.pdf",
            content: data.pdfBase64,
          },
        ],
      }),
    })

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string } | null
      throw new Error(payload?.message || "שליחת המייל נכשלה")
    }

    return { sent: data.to.length }
  })

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}
