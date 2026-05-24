-- Initial schema: users + artifacts (handoff §8, Sprint 1 S1.2).
-- Append-only migration (SK-09): never edit after merge — supersede instead.

-- ---------------------------------------------------------------------------
-- App schema + shared trigger helpers
-- ---------------------------------------------------------------------------

create schema if not exists app;

-- Maintains updated_at on row update. search_path pinned to prevent
-- search-path attacks (SK-01 / SK-09).
create or replace function app.set_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Enums (closed sets — handoff §6 / §8)
-- ---------------------------------------------------------------------------

create type public.plan_state as enum (
  'free',
  'grandfather_eligible',
  'grandfather_locked',
  'pro'
);

create type public.artifact_mode as enum (
  'slides',
  'document'
);

-- ---------------------------------------------------------------------------
-- users — app profile extending auth.users
-- ---------------------------------------------------------------------------

create table public.users (
  id                          uuid primary key references auth.users (id) on delete cascade,
  email                       text not null unique,
  display_name                text,
  plan_state                  public.plan_state not null default 'free',
  signup_at                   timestamptz not null default now(),
  grandfather_eligible_until  timestamptz,
  suspended_at                timestamptz,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);
-- suspended_reason enum deferred to the suspension work (S8) — values still TBD.

create trigger users_set_updated_at
  before update on public.users
  for each row execute function app.set_updated_at();

alter table public.users enable row level security;

create policy users_select_own on public.users
  for select using (auth.uid() = id);
create policy users_insert_own on public.users
  for insert with check (auth.uid() = id);
create policy users_update_own on public.users
  for update using (auth.uid() = id) with check (auth.uid() = id);
-- No DELETE policy: account deletion is an operator/GDPR flow, not self-serve.

grant select, insert, update on public.users to authenticated;

-- ---------------------------------------------------------------------------
-- artifacts — uploaded HTML files
-- ---------------------------------------------------------------------------

create table public.artifacts (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.users (id) on delete cascade,
  title          text,
  r2_key         text not null unique,
  slide_count    integer,
  mode           public.artifact_mode,
  mode_override  public.artifact_mode,
  size_bytes     integer,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  deleted_at     timestamptz
);

create index artifacts_user_id_idx on public.artifacts (user_id);

create trigger artifacts_set_updated_at
  before update on public.artifacts
  for each row execute function app.set_updated_at();

alter table public.artifacts enable row level security;

-- Ownership-only policies. Soft-delete filtering (deleted_at) is an
-- application-query concern, kept out of RLS so restoration (S7) stays open.
create policy artifacts_select_own on public.artifacts
  for select using (auth.uid() = user_id);
create policy artifacts_insert_own on public.artifacts
  for insert with check (auth.uid() = user_id);
create policy artifacts_update_own on public.artifacts
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy artifacts_delete_own on public.artifacts
  for delete using (auth.uid() = user_id);

grant select, insert, update, delete on public.artifacts to authenticated;
