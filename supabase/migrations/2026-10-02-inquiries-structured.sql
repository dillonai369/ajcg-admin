-- ============================================================
-- Inquiries: structured lead storage + workflow columns
-- Run once in Supabase → SQL Editor. Safe to re-run (IF NOT EXISTS).
-- ============================================================
--
-- Why: every form field that wasn't name/email/phone was being flattened into
-- the `message` text column as "Label: value" lines. The admin could only show
-- the first 120 characters of that, with no date, no form type, no way to open
-- or update a lead. This adds real columns so leads are readable, filterable
-- and workable. The app writes these columns when they exist and falls back to
-- the old shape when they don't, so deploy order doesn't matter.

alter table inquiries add column if not exists form_type    text;              -- contact | buying | selling | quick_valuation | exchange_1031 | careers | property
alter table inquiries add column if not exists details      jsonb default '{}'::jsonb;  -- every non-core field, keyed by input name
alter table inquiries add column if not exists page_url     text;
alter table inquiries add column if not exists referrer     text;
alter table inquiries add column if not exists utm_source   text;
alter table inquiries add column if not exists utm_medium   text;
alter table inquiries add column if not exists utm_campaign text;
alter table inquiries add column if not exists utm_content  text;
alter table inquiries add column if not exists sms_consent  boolean default false;
alter table inquiries add column if not exists assigned_to  text;              -- broker slug
alter table inquiries add column if not exists resume_path  text;              -- storage path in the private "resumes" bucket
alter table inquiries add column if not exists updated_at   timestamptz default now();

create index if not exists inquiries_form_type_idx on inquiries(form_type);
create index if not exists inquiries_assigned_to_idx on inquiries(assigned_to);

-- Keep updated_at honest on every change (same trigger the other tables use).
drop trigger if exists inquiries_updated_at on inquiries;
create trigger inquiries_updated_at before update on inquiries for each row execute function set_updated_at();

-- Close the side door. The old policy let anyone holding the public anon key
-- insert directly into inquiries, skipping the spam screening in the API. The
-- app only ever inserts with the service-role key (server-side), so this
-- policy was never needed.
drop policy if exists "Anyone can submit an inquiry" on inquiries;

-- Private bucket for careers résumés. Files are served to admins through
-- short-lived signed URLs; nothing here is public.
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do nothing;
