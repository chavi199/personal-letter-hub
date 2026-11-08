/** Template token in content-bank snippets. Replaced with the letter recipient's name on insert. */
export const PERSON_PLACEHOLDER = "XX"

/** Short UI copy — use wherever users write or pick bank snippets. */
export const PERSON_PLACEHOLDER_HINT =
  "XX = שם האדם שכותבים לו. לדוגמה: «XX היקרה» יהפוך לשם שלה במכתב."

export function personPlaceholderHintFor(personName: string): string {
  const name = personName.trim()
  if (!name) return PERSON_PLACEHOLDER_HINT
  return `XX = שם האדם במכתב. כאן: «XX» יוחלף ב«${name}» (לדוגמה: XX היקרה → ${name} היקרה).`
}

/** Replace every XX with the person name when inserting into a letter. */
export function fillPersonPlaceholder(text: string, personName: string): string {
  const name = personName.trim()
  if (!name) return text
  return text.split(PERSON_PLACEHOLDER).join(name)
}

/** When saving selected letter text to the bank, turn the person name back into XX. */
export function extractPersonPlaceholder(text: string, personName: string): string {
  const name = personName.trim()
  if (!name) return text
  return text.split(name).join(PERSON_PLACEHOLDER)
}
