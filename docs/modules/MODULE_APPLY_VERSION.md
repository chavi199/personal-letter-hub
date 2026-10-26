# MODULE - APPLY VERSION

## Purpose

Apply an existing version to multiple people.

The original letters must never be overwritten.

---

## Scope

Users can choose:

* Same group
* Other groups
* Individual people

---

## User Flow

User selects a version.

↓

Click **Apply Version**.

↓

Select target people.

↓

System creates a new version for each selected person.

↓

Operation completes.

---

## Functional Requirements

Copy:

* Letter structure
* Design
* Formatting

Keep:

Each person's own letter content.

Only create new versions.

---

## Business Rules

Never overwrite existing versions.

Every copied version is independent.

Errors for one person must not cancel the entire operation.

---

## UI Requirements

Multi-select.

Progress indicator.

Success summary.

Error summary.

---

## Database Impact

Creates new records inside:

letter_versions

---

## Future Extensions

Filters.

Apply by group.

Apply by tags.

Bulk operations.
