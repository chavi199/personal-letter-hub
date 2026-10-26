# MODULE - LETTER VERSIONS

## Purpose

Allow multiple versions of the same letter.

Users can safely experiment without losing previous work.

---

## Scope

Support:

* Save
* Save As Copy
* Restore Version
* Delete Version

---

## User Flow

User edits a letter.

↓

Choose:

Save

or

Save As Copy

↓

New version is created.

↓

User can switch between versions.

---

## Functional Requirements

Every version stores:

* Letter content
* Design configuration
* Creation date

---

## Business Rules

Original versions remain unchanged.

Deleting one version must not affect others.

Every version belongs to exactly one letter.

---

## UI Requirements

Version list.

Creation date.

Current version indicator.

Preview before restore.

---

## Database Impact

New table:

letter_versions

Related to:

letters

---

## Future Extensions

Version comparison.

Version labels.

Favorites.

Automatic snapshots.
