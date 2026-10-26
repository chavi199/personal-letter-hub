# DATABASE

## Provider

Supabase (PostgreSQL)

---

## Tables

### groups

| Column | Type | Notes |
|---|---|---|
| id | uuid | PRIMARY KEY, default gen_random_uuid() |
| user_id | uuid | REFERENCES auth.users, NOT NULL |
| name | text | NOT NULL |
| created_at | timestamptz | default now() |

RLS: user sees only own groups (`user_id = auth.uid()`)

---

### people

| Column | Type | Notes |
|---|---|---|
| id | uuid | PRIMARY KEY, default gen_random_uuid() |
| group_id | uuid | REFERENCES groups ON DELETE CASCADE |
| name | text | NOT NULL |
| status | text | default 'not_started' — values: not_started / draft / completed |
| letter_content | text | default '' |
| personal_notes | text | default '' |
| personal_ideas | text | default '' |
| personal_traits | text | default '' |
| personal_info | text | default '' |
| created_at | timestamptz | default now() |

RLS: user sees only people in own groups

---

### content_items

| Column | Type | Notes |
|---|---|---|
| id | uuid | PRIMARY KEY, default gen_random_uuid() |
| user_id | uuid | REFERENCES auth.users, NOT NULL |
| type | text | NOT NULL — values: opening / compliment / closing |
| content | text | NOT NULL |
| category | text | nullable |
| created_at | timestamptz | default now() |

RLS: user sees only own items (`user_id = auth.uid()`)

---

### letter_versions

| Column | Type | Notes |
|---|---|---|
| id | uuid | PRIMARY KEY, default gen_random_uuid() |
| person_id | uuid | REFERENCES people ON DELETE CASCADE, NOT NULL |
| user_id | uuid | REFERENCES auth.users, default auth.uid(), NOT NULL |
| label | text | nullable — future use |
| letter_content | text | NOT NULL, default '' |
| created_at | timestamptz | default now() NOT NULL |

RLS: user sees only own versions (`user_id = auth.uid()`)

Index: `letter_versions_person_id_idx` on `person_id`

---

## Relationships

```
auth.users
  └── groups (user_id)
        └── people (group_id)
              └── letter_versions (person_id)
  └── content_items (user_id)
  └── letter_versions (user_id)
```

---

## Notes

- All tables have RLS enabled.
- `letter_versions` stores snapshots only — never overwrites `people.letter_content`.
- Deleting a person cascades to all their versions.
- Deleting a group cascades to all its people (and their versions).
