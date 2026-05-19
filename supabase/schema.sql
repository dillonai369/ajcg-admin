-- ============================================================
-- AJ Commercial Group — Supabase schema
-- Run this in the Supabase SQL editor (Project → SQL → New query)
-- ============================================================

-- Brokers (9 rows on launch — Joey, Anthony, Merry, Tyler, Brianna, Ketyra, Brandon, Alex, Katie)
create table if not exists brokers (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  page_slug   text,
  name        text not null,
  title       text,
  email       text,
  phone       text,
  phone_raw   text,
  photo_url   text,           -- /assets/team/joey-hero.jpg or full URL or Supabase Storage URL
  card_photo_url text,
  bio         text,
  is_partner  boolean default false,
  display_order int default 99,

  -- Optional editable extensions
  tagline     text,
  license_number text,
  linkedin_url text,
  crexi_url   text,
  specialties text[],
  years_in_cre int,
  joined_date date,
  education   text,
  certifications text,
  languages   text,
  total_closed text,
  units_sold  text,
  deals_closed int,
  avg_days_on_market int,
  show_on_team_page boolean default true,
  feature_on_homepage boolean default false,
  hide_phone  boolean default false,

  -- Track record is denormalized for quick reads (mirrors the JSON shape)
  track_record jsonb default '[]'::jsonb,

  -- SEO
  canonical_url text,
  meta_description text,

  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create index if not exists brokers_display_order_idx on brokers(display_order);

-- Properties (64 on launch)
create table if not exists properties (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  page_slug   text,
  name        text not null,
  location    text,           -- "1016 E. Division St, Lombard, IL · 12-Unit Multifamily"
  address     text,
  city        text,
  state       text default 'IL',
  zip         text,
  neighborhood text,
  submarket   text,
  units       text,
  type        text default 'Multifamily',
  status      text default 'sold',   -- sold | for sale | under contract | coming soon | draft
  description text,
  body        text,

  -- Photos
  hero_image  text,
  images      text[] default '{}',

  -- Building specs
  total_sqft  text,
  lot_size    text,
  year_built  text,
  year_renovated text,
  stories     text,
  building_class text,
  parking     text,
  heating     text,

  -- Financials
  sale_price  text,
  sale_date   date,
  cap_rate    text,
  noi         text,
  gross_income text,
  hide_sale_price boolean default false,

  -- Highlights & assignment
  highlights  text[] default '{}',
  broker_slugs text[] default '{}',  -- slugs of brokers who closed this deal

  -- Display
  feature_on_homepage boolean default false,
  show_in_sold_carousel boolean default true,

  -- SEO
  canonical_url text,
  meta_title  text,
  meta_description text,

  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create index if not exists properties_status_idx on properties(status);
create index if not exists properties_sale_date_idx on properties(sale_date desc);

-- Blog posts
create table if not exists posts (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  title       text not null,
  excerpt     text,
  category    text default 'Insights',
  tags        text[] default '{}',
  status      text default 'draft',   -- draft | published | scheduled

  hero_image  text,
  hero_alt    text,
  hero_image_class text,

  -- Block-based body (matches PostBlock TypeScript type)
  blocks      jsonb default '[]'::jsonb,

  author_slug text,                  -- references brokers.slug
  published_at timestamptz,
  views       int default 0,

  -- SEO
  meta_title  text,
  meta_description text,

  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create index if not exists posts_status_idx on posts(status);
create index if not exists posts_published_at_idx on posts(published_at desc);

-- Form submissions / inquiries (the "Recent inquiries" widget feeds from here)
create table if not exists inquiries (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text,
  phone       text,
  message     text,
  source      text default 'contact form',  -- contact form | listing page | careers | referral
  property_slug text,             -- if from a property page
  broker_slug text,               -- if directed to a specific broker
  status      text default 'new',           -- new | contacted | in progress | closed
  notes       text,
  created_at  timestamptz default now()
);

create index if not exists inquiries_status_idx on inquiries(status);
create index if not exists inquiries_created_at_idx on inquiries(created_at desc);

-- Activity log (the "Recent activity" widget feeds from here)
create table if not exists activity (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null,                -- listing.created | listing.updated | broker.updated | post.published | inquiry.received
  entity      text,                         -- the slug or id of the affected row
  actor       text,                         -- "Joey" | "Anthony" | "Visitor" | "System"
  summary     text,
  metadata    jsonb default '{}'::jsonb,
  created_at  timestamptz default now()
);

create index if not exists activity_created_at_idx on activity(created_at desc);

-- ============================================================
-- updated_at triggers
-- ============================================================
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger brokers_updated_at before update on brokers for each row execute function set_updated_at();
create trigger properties_updated_at before update on properties for each row execute function set_updated_at();
create trigger posts_updated_at before update on posts for each row execute function set_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================
-- Public website needs to READ everything published
-- Admin writes happen via the service_role key (server-side only)

alter table brokers enable row level security;
alter table properties enable row level security;
alter table posts enable row level security;
alter table inquiries enable row level security;
alter table activity enable row level security;

-- Public read policies
create policy "Public can read brokers" on brokers for select using (show_on_team_page = true);
create policy "Public can read properties" on properties for select using (status in ('sold','for sale','under contract','coming soon'));
create policy "Public can read published posts" on posts for select using (status = 'published');

-- Inquiry submission (forms on the public site insert with the anon key)
create policy "Anyone can submit an inquiry" on inquiries for insert with check (true);

-- All other operations go through the service_role key in server-side code, which bypasses RLS

-- ============================================================
-- Storage buckets
-- ============================================================
-- Run this in Supabase Storage UI (or via SQL):
-- 1) Create bucket "broker-photos" — public
-- 2) Create bucket "property-photos" — public
-- 3) Create bucket "blog-images" — public
-- Each bucket gets public-read access; uploads go through admin (service_role).
