/** Template token in content-bank snippets. Replaced with the letter recipient's name on insert. */
export const PERSON_PLACEHOLDER = "XX"

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
