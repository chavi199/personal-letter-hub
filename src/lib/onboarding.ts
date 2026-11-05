const SESSION_SKIP_KEY = "letter-hub:welcome-skipped-session"
const CHECKLIST_HIDDEN_KEY = "letter-hub:onboarding-checklist-hidden"

function canUseStorage() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined"
}

function canUseSession() {
  return typeof window !== "undefined" && typeof sessionStorage !== "undefined"
}

/** Skip lasts for this browser tab only, so the welcome shows again next visit. */
export function isWelcomeSkippedThisSession(): boolean {
  if (!canUseSession()) return false
  try {
    return sessionStorage.getItem(SESSION_SKIP_KEY) === "1"
  } catch {
    return false
  }
}

export function skipWelcomeThisSession(): void {
  if (!canUseSession()) return
  try {
    sessionStorage.setItem(SESSION_SKIP_KEY, "1")
  } catch {
    /* ignore */
  }
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

/** Welcome wizard: every user, every new visit, until they skip in this tab. */
export function shouldShowWelcome(): boolean {
  return !isWelcomeSkippedThisSession()
}
