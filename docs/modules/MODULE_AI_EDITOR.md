# MODULE - AI LETTER EDITOR

## Purpose

Provide automatic language formatting for existing letters without changing their meaning.

The AI is an assistant for formatting only.

It must never rewrite the user's personal message.

---

## Scope

Supported actions:

* Correct spelling mistakes.
* Correct punctuation.
* Improve paragraph structure.
* Improve line breaks.
* Remove unnecessary spaces.

The original wording and meaning must remain unchanged.

---

## User Flow

User opens a letter.

↓

User clicks **"AI Edit"**.

↓

The system sends the current letter to the AI service.

↓

The AI returns a formatted version.

↓

The user compares the result.

↓

The user chooses:

* Replace current version.
* Save as new version.
* Cancel.

---

## Functional Requirements

The AI must preserve:

* Writing style.
* Tone.
* Message.
* Order of ideas.

The AI may only improve readability.

---

## Business Rules

Never invent information.

Never remove information.

Never shorten the letter.

Never make assumptions.

If no corrections are required, return the original letter.

---

## UI Requirements

Show loading state.

Allow retry.

Allow cancel.

Display formatted result before saving.

---

## Database Impact

None.

The module only returns edited text.

Saving is handled by Letter Versions.

---

## Future Extensions

Multiple AI providers.

Language selection.

Correction history.

Quality score.
