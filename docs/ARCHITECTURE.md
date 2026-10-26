# ARCHITECTURE

## Architecture Goals

The project should remain modular.

Each feature must be implemented as an independent module whenever possible.

---

## Main Layers

UI

↓

Components

↓

Services

↓

Supabase

---

## General Rules

Business logic should stay outside UI components.

Database access should be centralized.

Reusable components should be preferred.

Avoid duplicate logic.

---

## Future Modules

* AI Letter Editor
* Letter Design
* Letter Versions
* Apply Versions
* Subscription System

Every future module should integrate without changing existing architecture.
