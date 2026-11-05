-- Feature 15: public read-only share links for letters.
-- Run this file in the Supabase SQL Editor (or via supabase db push).
-- Safe to re-run: uses IF NOT EXISTS / DROP POLICY IF EXISTS.

create extension if not exists pgcrypto;

create table if not exists public.letter_share_links (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.people (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  token text not null,
  is_active boolean not null default true,
  recipient_name text not null default '',
  letter_content text not null default '',
  design_config jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  revoked_at timestamptz
);

create unique index if not exists letter_share_links_token_uidx
  on public.letter_share_links (token);

-- At most one active link per person (rotate = deactivate then insert).
create unique index if not exists letter_share_links_one_active_per_person
  on public.letter_share_links (person_id)
  where (is_active = true);

create index if not exists letter_share_links_person_id_idx
  on public.letter_share_links (person_id);

create index if not exists letter_share_links_user_id_idx
  on public.letter_share_links (user_id);

alter table public.letter_share_links enable row level security;

grant select, insert, update, delete on public.letter_share_links to authenticated;
-- anon must NOT get table grants; public access is only via RPC below.

drop policy if exists "share_links_select_own" on public.letter_share_links;
create policy "share_links_select_own" on public.letter_share_links
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "share_links_insert_own" on public.letter_share_links;
create policy "share_links_insert_own" on public.letter_share_links
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.people p
      join public.groups g on g.id = p.group_id
      where p.id = person_id and g.user_id = auth.uid()
    )
  );

drop policy if exists "share_links_update_own" on public.letter_share_links;
create policy "share_links_update_own" on public.letter_share_links
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "share_links_delete_own" on public.letter_share_links;
create policy "share_links_delete_own" on public.letter_share_links
  for delete to authenticated
  using (user_id = auth.uid());

-- Strong token helper (url-safe, ~43 chars from 32 random bytes).
create or replace function public.generate_share_token()
returns text
language sql
volatile
as $$
  select rtrim(translate(encode(gen_random_bytes(32), 'base64'), '+/', '-_'), '=');
$$;

-- Public read by token only. Never expose person_id / user_id.
-- Inactive / unknown tokens return { "is_active": false } without letter body.
create or replace function public.get_shared_letter(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  row_rec public.letter_share_links%rowtype;
begin
  if p_token is null or length(trim(p_token)) < 20 then
    return jsonb_build_object('is_active', false);
  end if;

  select *
  into row_rec
  from public.letter_share_links
  where token = trim(p_token)
  limit 1;

  if not found then
    return jsonb_build_object('is_active', false);
  end if;

  if row_rec.is_active is not true then
    return jsonb_build_object('is_active', false);
  end if;

  return jsonb_build_object(
    'is_active', true,
    'recipient_name', row_rec.recipient_name,
    'letter_content', row_rec.letter_content,
    'design_config', coalesce(row_rec.design_config, 'null'::jsonb),
    'updated_at', row_rec.updated_at
  );
end;
$$;

revoke all on function public.get_shared_letter(text) from public;
grant execute on function public.get_shared_letter(text) to anon, authenticated;

-- Allow public (unauthenticated) reads of design assets used in shared letters.
-- Bucket is already public; this opens SELECT for anon on that bucket only.
drop policy if exists "anon read design assets" on storage.objects;
create policy "anon read design assets"
on storage.objects for select to anon
using (bucket_id = 'letter-design-assets');

notify pgrst, 'reload schema';
