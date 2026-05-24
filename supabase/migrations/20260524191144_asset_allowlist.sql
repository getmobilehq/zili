-- Asset allow-list (handoff §8, build sequence step 7). The Cloudflare asset
-- proxy reads this table to decide which external origins an artifact may load.
-- Append-only migration (SK-09).

create table public.asset_allowlist (
  id          uuid primary key default gen_random_uuid(),
  origin      text not null unique,
  added_by    uuid references public.users (id) on delete set null, -- null for seeds
  reason      text,
  created_at  timestamptz not null default now()
);

alter table public.asset_allowlist enable row level security;

-- The origin list is not sensitive (it is also reflected in the CSP). The
-- asset-proxy Worker reads it via PostgREST with the anon key, so allow public
-- SELECT. Writes happen only through the service role / admin actions (SK-02),
-- which bypass RLS — no insert/update/delete policy means those are denied here.
create policy asset_allowlist_public_read on public.asset_allowlist
  for select using (true);

grant select on public.asset_allowlist to anon, authenticated;

-- Seed widely-used, low-risk CDNs common in LLM-generated HTML. Specific
-- origins only — never wildcards (SK-02).
insert into public.asset_allowlist (origin, reason) values
  ('https://cdn.tailwindcss.com', 'Tailwind Play CDN — extremely common in LLM artifacts'),
  ('https://fonts.googleapis.com', 'Google Fonts stylesheets'),
  ('https://fonts.gstatic.com', 'Google Fonts font files'),
  ('https://cdn.jsdelivr.net', 'jsDelivr — general-purpose package CDN'),
  ('https://unpkg.com', 'unpkg — npm package CDN'),
  ('https://cdnjs.cloudflare.com', 'cdnjs — common library CDN');
