-- Run this once in your Supabase project's SQL editor (Supabase Dashboard > SQL Editor > New query).

create extension if not exists pgcrypto;

create table if not exists guests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  full_name_normalized text generated always as (lower(regexp_replace(full_name, '\s+', ' ', 'g'))) stored,
  attending boolean not null,
  plus_one boolean not null default false,
  plus_one_name text,
  meal_preference text,            -- 'non_veg' | 'vegetarian' | 'halal' | 'vegan' | 'other'
  plus_one_meal_preference text,
  dietary_restrictions text,
  well_wishes text,
  contact text,                    -- optional phone/email so Allen can follow up
  flagged_duplicate_of uuid references guests(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists guests_name_idx on guests (full_name_normalized);

-- keep updated_at fresh on edits from the admin dashboard
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists guests_set_updated_at on guests;
create trigger guests_set_updated_at
  before update on guests
  for each row execute function set_updated_at();

-- Row Level Security: the public site only ever talks to Supabase through
-- the Next.js API routes using the service-role key (server-side only), so
-- RLS stays locked down and no key is ever exposed to the browser.
alter table guests enable row level security;
-- No policies are created on purpose: with RLS on and zero policies, the
-- anon/public key (if it ever leaked) cannot read or write this table at all.
