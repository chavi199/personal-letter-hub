const DISMISSED_KEY = "letter-hub:onboarding-dismissed"
const CHECKLIST_HIDDEN_KEY = "letter-hub:onboarding-checklist-hidden"

function canUseStorage() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined"
}

export function isOnboardingDismissed(): boolean {
  if (!canUseStorage()) return false
  try {
    return localStorage.getItem(DISMISSED_KEY) === "1"
  } catch {
    return false
  }
}

export function dismissOnboarding(): void {
  if (!canUseStorage()) return
  try {
    localStorage.setItem(DISMISSED_KEY, "1")
  } catch {
    /* ignore quota / private mode */
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

/** Welcome wizard: show only when there are no groups and user hasn't skipped. */
export function shouldShowWelcome(groupsCount: number): boolean {
  return groupsCount === 0 && !isOnboardingDismissed()
}
