-- Core tables for Personal Letter Hub.
-- Run once in the Supabase SQL Editor. Safe to run again.

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.people (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  name text not null,
  status text not null default 'not_started'
    check (status in ('not_started', 'draft', 'completed')),
  letter_content text not null default '',
  personal_notes text not null default '',
  personal_ideas text not null default '',
  personal_traits text not null default '',
  personal_info text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in ('opening', 'compliment', 'closing')),
  content text not null,
  category text,
  created_at timestamptz not null default now()
);

create table if not exists public.letter_versions (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.people (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  label text,
  letter_content text not null default '',
  design_config jsonb,
  created_at timestamptz not null default now()
);

create index if not exists letter_versions_person_id_idx
  on public.letter_versions (person_id);

alter table public.groups enable row level security;
alter table public.people enable row level security;
alter table public.content_items enable row level security;
alter table public.letter_versions enable row level security;

grant select, insert, update, delete on public.groups to authenticated;
grant select, insert, update, delete on public.people to authenticated;
grant select, insert, update, delete on public.content_items to authenticated;
grant select, insert, update, delete on public.letter_versions to authenticated;

drop policy if exists "groups_select_own" on public.groups;
create policy "groups_select_own" on public.groups
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "groups_insert_own" on public.groups;
create policy "groups_insert_own" on public.groups
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "groups_update_own" on public.groups;
create policy "groups_update_own" on public.groups
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "groups_delete_own" on public.groups;
create policy "groups_delete_own" on public.groups
  for delete to authenticated
  using (user_id = auth.uid());

drop policy if exists "people_select_own" on public.people;
create policy "people_select_own" on public.people
  for select to authenticated
  using (
    exists (
      select 1 from public.groups g
      where g.id = people.group_id and g.user_id = auth.uid()
    )
  );

drop policy if exists "people_insert_own" on public.people;
create policy "people_insert_own" on public.people
  for insert to authenticated
  with check (
    exists (
      select 1 from public.groups g
      where g.id = people.group_id and g.user_id = auth.uid()
    )
  );

drop policy if exists "people_update_own" on public.people;
create policy "people_update_own" on public.people
  for update to authenticated
  using (
    exists (
      select 1 from public.groups g
      where g.id = people.group_id and g.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.groups g
      where g.id = people.group_id and g.user_id = auth.uid()
    )
  );

drop policy if exists "people_delete_own" on public.people;
create policy "people_delete_own" on public.people
  for delete to authenticated
  using (
    exists (
      select 1 from public.groups g
      where g.id = people.group_id and g.user_id = auth.uid()
    )
  );

drop policy if exists "content_select_own" on public.content_items;
create policy "content_select_own" on public.content_items
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "content_insert_own" on public.content_items;
create policy "content_insert_own" on public.content_items
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "content_update_own" on public.content_items;
create policy "content_update_own" on public.content_items
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "content_delete_own" on public.content_items;
create policy "content_delete_own" on public.content_items
  for delete to authenticated
  using (user_id = auth.uid());

drop policy if exists "versions_select_own" on public.letter_versions;
create policy "versions_select_own" on public.letter_versions
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "versions_insert_own" on public.letter_versions;
create policy "versions_insert_own" on public.letter_versions
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "versions_update_own" on public.letter_versions;
create policy "versions_update_own" on public.letter_versions
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "versions_delete_own" on public.letter_versions;
create policy "versions_delete_own" on public.letter_versions
  for delete to authenticated
  using (user_id = auth.uid());

insert into storage.buckets (id, name, public)
values ('letter-design-assets', 'letter-design-assets', true)
on conflict (id) do nothing;

drop policy if exists "users upload own assets" on storage.objects;
create policy "users upload own assets"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'letter-design-assets'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "public read design assets" on storage.objects;
create policy "public read design assets"
on storage.objects for select to authenticated
using (bucket_id = 'letter-design-assets');

drop policy if exists "users delete own assets" on storage.objects;
create policy "users delete own assets"
on storage.objects for delete to authenticated
using (
  bucket_id = 'letter-design-assets'
  and auth.uid()::text = (storage.foldername(name))[1]
);

notify pgrst, 'reload schema';
