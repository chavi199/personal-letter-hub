const CHECKLIST_HIDDEN_KEY = "letter-hub:onboarding-checklist-hidden"

function canUseStorage() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined"
}

export function isChecklistHidden(): boolean {
  if (!canUseStorage()) return false
  try {
    return localStorage.getItem(CHECKLIST_HIDDEN_KEY) === "1"
  } catch {
    return false
  }
}

export function hideChecklist(): void {
  if (!canUseStorage()) return
  try {
    localStorage.setItem(CHECKLIST_HIDDEN_KEY, "1")
  } catch {
    /* ignore */
  }
}

