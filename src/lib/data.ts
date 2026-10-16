/**
 * Data layer. Routes to Supabase when configured, JSON files otherwise.
 *
 * The dispatch happens per-call, so as soon as you populate .env.local
 * with Supabase keys and run `npm run seed`, the admin starts reading
 * and writing the database.
 *
 * All API routes call these functions. Public API signatures are stable.
 */
import fs from "fs/promises";
import path from "path";
import type { Broker, Property, Post } from "./types";
import { isSupabaseConfigured, supabaseAdmin } from "./supabase";

// =================================================================
// CACHING NOTES (2026-10-13: read caching REMOVED on purpose)
// =================================================================
// Reads used to go through unstable_cache (60s, tag-invalidated by the admin
// save handlers). Two things made that wrong for this deployment:
//
//   1. The public site (www) and the admin (app.) are separate Vercel
//      projects with separate data caches. revalidateTag() in a save handler
//      only clears the cache of the deployment that ran it, so www kept
//      serving the old row for up to a minute after an admin edit.
//   2. unstable_cache is stale-while-revalidate: the first request after the
//      TTL still returns the OLD value and refreshes in the background. Under
//      light traffic that "first request" is the editor checking their work —
//      Mary edited 80 listings' SEO fields, opened the pages, saw the old
//      titles, and reasonably concluded the saves had reverted. They hadn't.
//
// Every page is already force-dynamic, so each view now does one direct
// Supabase read (tens of ms). The API routes still call revalidateTag — it's
// harmless and keeps any future route-level caching correct.

// =================================================================
// JSON FALLBACK (kept for local dev before Supabase is configured)
// =================================================================
const DATA_DIR = path.join(process.cwd(), "data");
const BROKERS_FILE = path.join(DATA_DIR, "brokers.json");
const PROPERTIES_FILE = path.join(DATA_DIR, "properties.json");
const POSTS_FILE = path.join(DATA_DIR, "posts.json");

const fileLocks = new Map<string, Promise<unknown>>();

async function withLock<T>(file: string, fn: () => Promise<T>): Promise<T> {
  const prev = fileLocks.get(file) ?? Promise.resolve();
  let release!: () => void;
  const next = new Promise<void>((resolve) => (release = resolve));
  fileLocks.set(file, prev.then(() => next));
  await prev;
  try {
    return await fn();
  } finally {
    release();
    if (fileLocks.get(file) === next) fileLocks.delete(file);
  }
}

async function readJson<T>(file: string): Promise<T> {
  const raw = await fs.readFile(file, "utf8");
  return JSON.parse(raw) as T;
}

async function writeJsonAtomic(file: string, data: unknown): Promise<void> {
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
  await fs.rename(tmp, file);
}

// =================================================================
// BROKERS
// =================================================================
export async function getBrokers(): Promise<Broker[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabaseAdmin()
      .from("brokers")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as Broker[];
  }
  const list = await readJson<Broker[]>(BROKERS_FILE);
  return [...list].sort((a, b) => (a.display_order ?? 999) - (b.display_order ?? 999));
}

export async function getBroker(slug: string): Promise<Broker | null> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabaseAdmin().from("brokers").select("*").eq("slug", slug).maybeSingle();
    if (error) throw error;
    return (data as Broker) ?? null;
  }
  const list = await readJson<Broker[]>(BROKERS_FILE);
  return list.find((b) => b.slug === slug) ?? null;
}

export async function saveBroker(slug: string, data: Partial<Broker>): Promise<Broker | null> {
  if (isSupabaseConfigured) {
    const { slug: _ignore, id: _id, created_at: _ca, updated_at: _ua, ...patch } = data as Record<string, unknown>;
    const { data: row, error } = await supabaseAdmin()
      .from("brokers")
      .update(patch)
      .eq("slug", slug)
      .select("*")
      .maybeSingle();
    if (error) throw error;
    return (row as Broker) ?? null;
  }
  return withLock(BROKERS_FILE, async () => {
    const list = await readJson<Broker[]>(BROKERS_FILE);
    const idx = list.findIndex((b) => b.slug === slug);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...data, slug: list[idx].slug };
    await writeJsonAtomic(BROKERS_FILE, list);
    return list[idx];
  });
}

export async function createBroker(data: Partial<Broker> & { slug: string }): Promise<Broker> {
  if (isSupabaseConfigured) {
    const insert = {
      ...data,
      slug: data.slug,
      name: data.name ?? "Untitled Broker",
      title: data.title ?? "Commercial Broker",
      email: data.email ?? null,
      phone: data.phone ?? null,
      photo_url: data.photo_url ?? null,
      bio: data.bio ?? null,
      is_partner: data.is_partner ?? false,
      display_order: data.display_order ?? 99,
      track_record: data.track_record ?? [],
    };
    const { data: row, error } = await supabaseAdmin()
      .from("brokers")
      .insert(insert)
      .select("*")
      .single();
    if (error) throw error;
    return row as Broker;
  }
  return withLock(BROKERS_FILE, async () => {
    const list = await readJson<Broker[]>(BROKERS_FILE);
    if (list.some((b) => b.slug === data.slug)) throw new Error(`Broker "${data.slug}" exists`);
    const broker: Broker = {
      ...data,
      slug: data.slug,
      name: data.name ?? "Untitled Broker",
      title: data.title ?? "Commercial Broker",
      email: data.email ?? "",
      phone: data.phone ?? "",
      photo_url: data.photo_url ?? "",
      bio: data.bio ?? "",
      track_record: data.track_record ?? [],
      is_partner: data.is_partner ?? false,
      display_order: data.display_order ?? list.length,
    };
    list.push(broker);
    await writeJsonAtomic(BROKERS_FILE, list);
    return broker;
  });
}

export async function deleteBroker(slug: string): Promise<boolean> {
  if (isSupabaseConfigured) {
    const { error, count } = await supabaseAdmin().from("brokers").delete({ count: "exact" }).eq("slug", slug);
    if (error) throw error;
    return (count ?? 0) > 0;
  }
  return withLock(BROKERS_FILE, async () => {
    const list = await readJson<Broker[]>(BROKERS_FILE);
    const next = list.filter((b) => b.slug !== slug);
    if (next.length === list.length) return false;
    await writeJsonAtomic(BROKERS_FILE, next);
    return true;
  });
}

// =================================================================
// PROPERTIES
// =================================================================
/**
 * Every column except `body` (the long write-up). Measured 2026-10-16: the
 * homepage and /recently-sold spent ~1.3s of their ~1.4s response time pulling
 * all 80 listings with `select *`; a single-row page took ~0.3s. List views
 * never render `body` — only the detail page does, via getProperty().
 */
const PROPERTY_LIST_COLUMNS = [
  "id", "slug", "page_slug", "name", "location", "address", "city", "state", "zip", "neighborhood", "submarket",
  "units", "type", "status", "description", "hero_image", "images", "total_sqft", "lot_size", "year_built",
  "year_renovated", "stories", "building_class", "parking", "heating", "sale_price", "sale_date", "cap_rate", "noi",
  "gross_income", "hide_sale_price", "highlights", "broker_slugs", "feature_on_homepage", "show_in_sold_carousel",
  "canonical_url", "meta_title", "meta_description", "created_at", "updated_at",
].join(",");

export async function getProperties(): Promise<Property[]> {
  if (isSupabaseConfigured) {
    // Order by created_at desc so newly-added listings always appear first.
    const { data, error } = await supabaseAdmin()
      .from("properties")
      .select(PROPERTY_LIST_COLUMNS)
      .order("created_at", { ascending: false, nullsFirst: false });
    if (error) throw error;
    return (data ?? []) as unknown as Property[];
  }
  return readJson<Property[]>(PROPERTIES_FILE);
}

export async function getProperty(slug: string): Promise<Property | null> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabaseAdmin().from("properties").select("*").eq("slug", slug).maybeSingle();
    if (error) throw error;
    return (data as Property) ?? null;
  }
  const list = await readJson<Property[]>(PROPERTIES_FILE);
  return list.find((p) => p.slug === slug) ?? null;
}

export async function saveProperty(slug: string, data: Partial<Property>): Promise<Property | null> {
  if (isSupabaseConfigured) {
    const { slug: _ignore, id: _id, created_at: _ca, updated_at: _ua, ...patch } = data as Record<string, unknown>;
    const { data: row, error } = await supabaseAdmin()
      .from("properties")
      .update(patch)
      .eq("slug", slug)
      .select("*")
      .maybeSingle();
    if (error) throw error;
    return (row as Property) ?? null;
  }
  return withLock(PROPERTIES_FILE, async () => {
    const list = await readJson<Property[]>(PROPERTIES_FILE);
    const idx = list.findIndex((p) => p.slug === slug);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...data, slug: list[idx].slug };
    await writeJsonAtomic(PROPERTIES_FILE, list);
    return list[idx];
  });
}

export async function createProperty(data: Partial<Property> & { slug: string }): Promise<Property> {
  if (isSupabaseConfigured) {
    const insert = {
      ...data,
      slug: data.slug,
      name: data.name ?? "Untitled Listing",
      type: data.type ?? "Multifamily",
      status: data.status ?? "draft",
    };
    const { data: row, error } = await supabaseAdmin().from("properties").insert(insert).select("*").single();
    if (error) throw error;
    return row as Property;
  }
  return withLock(PROPERTIES_FILE, async () => {
    const list = await readJson<Property[]>(PROPERTIES_FILE);
    if (list.some((p) => p.slug === data.slug)) throw new Error(`Property "${data.slug}" exists`);
    const property: Property = {
      ...data,
      slug: data.slug,
      name: data.name ?? "Untitled Listing",
      units: data.units ?? "",
      type: data.type ?? "Multifamily",
      description: data.description ?? "",
      body: data.body ?? "",
      hero_image: data.hero_image ?? "",
      images: data.images ?? [],
      status: data.status ?? "draft",
    };
    list.push(property);
    await writeJsonAtomic(PROPERTIES_FILE, list);
    return property;
  });
}

export async function deleteProperty(slug: string): Promise<boolean> {
  if (isSupabaseConfigured) {
    const { error, count } = await supabaseAdmin().from("properties").delete({ count: "exact" }).eq("slug", slug);
    if (error) throw error;
    return (count ?? 0) > 0;
  }
  return withLock(PROPERTIES_FILE, async () => {
    const list = await readJson<Property[]>(PROPERTIES_FILE);
    const next = list.filter((p) => p.slug !== slug);
    if (next.length === list.length) return false;
    await writeJsonAtomic(PROPERTIES_FILE, next);
    return true;
  });
}

// =================================================================
// POSTS
// =================================================================
/** Every column except `blocks` (the full article, ~10k words across the 10 SEO posts). Detail pages use getPost(). */
const POST_LIST_COLUMNS = [
  "id", "slug", "title", "excerpt", "category", "tags", "status", "hero_image", "hero_alt", "hero_image_class",
  "author_slug", "published_at", "views", "meta_title", "meta_description", "created_at", "updated_at",
].join(",");

export async function getPosts(): Promise<Post[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabaseAdmin()
      .from("posts")
      .select(POST_LIST_COLUMNS)
      .order("published_at", { ascending: false, nullsFirst: false });
    if (error) throw error;
    return (data ?? []) as unknown as Post[];
  }
  return readJson<Post[]>(POSTS_FILE);
}

export async function getPost(slug: string): Promise<Post | null> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabaseAdmin().from("posts").select("*").eq("slug", slug).maybeSingle();
    if (error) throw error;
    return (data as Post) ?? null;
  }
  const list = await readJson<Post[]>(POSTS_FILE);
  return list.find((p) => p.slug === slug) ?? null;
}

/**
 * The `posts` table columns are `author_slug` and `published_at`, but the admin
 * editor and Post type use `author` and `date`. Without this remap, saving a
 * post from the admin throws "column author does not exist" and the edit is
 * lost. Map the app's field names onto the real DB columns on every write.
 */
function mapPostWriteColumns(obj: Record<string, unknown>): Record<string, unknown> {
  const out = { ...obj };
  if ("author" in out) {
    if (out.author != null && out.author_slug == null) out.author_slug = out.author;
    delete out.author;
  }
  if ("date" in out) {
    if (out.date != null && out.published_at == null) out.published_at = out.date;
    delete out.date;
  }
  return out;
}

export async function savePost(slug: string, data: Partial<Post>): Promise<Post | null> {
  if (isSupabaseConfigured) {
    const { slug: _ignore, id: _id, created_at: _ca, updated_at: _ua, ...rawPatch } = data as Record<string, unknown>;
    const patch = mapPostWriteColumns(rawPatch);
    const { data: row, error } = await supabaseAdmin()
      .from("posts")
      .update(patch)
      .eq("slug", slug)
      .select("*")
      .maybeSingle();
    if (error) throw error;
    return (row as Post) ?? null;
  }
  return withLock(POSTS_FILE, async () => {
    const list = await readJson<Post[]>(POSTS_FILE);
    const idx = list.findIndex((p) => p.slug === slug);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...data, slug: list[idx].slug };
    await writeJsonAtomic(POSTS_FILE, list);
    return list[idx];
  });
}

export async function createPost(data: Partial<Post> & { slug: string }): Promise<Post> {
  if (isSupabaseConfigured) {
    const insert = mapPostWriteColumns({
      ...data,
      slug: data.slug,
      title: data.title ?? "Untitled Post",
      category: data.category ?? "Market Updates",
      status: data.status ?? "draft",
    });
    const { data: row, error } = await supabaseAdmin().from("posts").insert(insert).select("*").single();
    if (error) throw error;
    return row as Post;
  }
  return withLock(POSTS_FILE, async () => {
    const list = await readJson<Post[]>(POSTS_FILE);
    if (list.some((p) => p.slug === data.slug)) throw new Error(`Post "${data.slug}" exists`);
    const post: Post = {
      ...data,
      slug: data.slug,
      title: data.title ?? "Untitled Post",
      category: data.category ?? "Market Updates",
      excerpt: data.excerpt ?? "",
      status: data.status ?? "draft",
    };
    list.push(post);
    await writeJsonAtomic(POSTS_FILE, list);
    return post;
  });
}

export async function deletePost(slug: string): Promise<boolean> {
  if (isSupabaseConfigured) {
    const { error, count } = await supabaseAdmin().from("posts").delete({ count: "exact" }).eq("slug", slug);
    if (error) throw error;
    return (count ?? 0) > 0;
  }
  return withLock(POSTS_FILE, async () => {
    const list = await readJson<Post[]>(POSTS_FILE);
    const next = list.filter((p) => p.slug !== slug);
    if (next.length === list.length) return false;
    await writeJsonAtomic(POSTS_FILE, next);
    return true;
  });
}

// =================================================================
// INQUIRIES (form submissions from the public site)
// =================================================================
export { INQUIRY_STATUSES, type InquiryStatus } from "./lead-forms";

export type Inquiry = {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  /** Plain-text summary (typed note first, then every detail as "Label: value"). */
  message?: string;
  /** Legacy: the form type. Kept because older rows only have this. */
  source?: string;
  /** contact | buying | selling | quick_valuation | exchange_1031 | careers | property */
  form_type?: string;
  /** Every non-core form field, keyed by its input name. */
  details?: Record<string, unknown>;
  page_url?: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  sms_consent?: boolean;
  property_slug?: string;
  broker_slug?: string;
  status?: string;
  assigned_to?: string;
  notes?: string;
  resume_path?: string;
  created_at?: string;
  updated_at?: string;
};

/**
 * Columns added by supabase/migrations/2026-10-02-inquiries-structured.sql.
 * If the migration hasn't run yet, inserts/updates that mention these fail
 * with an "unknown column" error — createInquiry() catches that and retries
 * without them, so a lead is never lost to a deploy-order mistake.
 */
const INQUIRY_EXTENDED_COLUMNS = [
  "form_type", "details", "page_url", "referrer",
  "utm_source", "utm_medium", "utm_campaign", "utm_content",
  "sms_consent", "assigned_to", "resume_path", "updated_at",
] as const;

function isUnknownColumnError(err: unknown): boolean {
  const e = err as { code?: string; message?: string } | null;
  if (!e) return false;
  // PGRST204 = PostgREST "column not found in schema cache"; 42703 = Postgres undefined_column.
  if (e.code === "PGRST204" || e.code === "42703") return true;
  return /column/i.test(e.message ?? "") && /(not find|does not exist|schema cache)/i.test(e.message ?? "");
}

function stripExtendedColumns<T extends Record<string, unknown>>(row: T): Partial<T> {
  const out: Record<string, unknown> = { ...row };
  for (const col of INQUIRY_EXTENDED_COLUMNS) delete out[col];
  return out as Partial<T>;
}

export type InquiryListOptions = {
  status?: string;
  formType?: string;
  /** Case-insensitive match on name, email, phone, message. */
  search?: string;
  limit?: number;
};

export async function getInquiries(opts: InquiryListOptions = {}): Promise<Inquiry[]> {
  if (!isSupabaseConfigured) return [];
  let q = supabaseAdmin()
    .from("inquiries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(opts.limit ?? 500);
  if (opts.status) q = q.eq("status", opts.status);
  if (opts.formType) q = q.or(`form_type.eq.${opts.formType},and(form_type.is.null,source.eq.${opts.formType})`);
  if (opts.search) {
    const s = opts.search.replace(/[%,()]/g, " ").trim();
    if (s) q = q.or(`name.ilike.%${s}%,email.ilike.%${s}%,phone.ilike.%${s}%,message.ilike.%${s}%`);
  }
  const { data, error } = await q;
  if (error) {
    // Pre-migration databases don't have form_type; fall back to the old shape
    // rather than blanking the admin.
    if (opts.formType && isUnknownColumnError(error)) {
      return getInquiries({ ...opts, formType: undefined }).then((rows) =>
        rows.filter((r) => (r.form_type || r.source) === opts.formType),
      );
    }
    throw error;
  }
  return (data ?? []) as Inquiry[];
}

export async function getInquiry(id: string): Promise<Inquiry | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabaseAdmin().from("inquiries").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as Inquiry | null) ?? null;
}

export async function createInquiry(data: Inquiry): Promise<Inquiry> {
  if (!isSupabaseConfigured) {
    // No-op in JSON mode (we don't persist inquiries to JSON)
    return data;
  }
  const db = supabaseAdmin();
  const first = await db.from("inquiries").insert(data).select("*").single();
  if (!first.error) return first.data as Inquiry;

  if (isUnknownColumnError(first.error)) {
    console.warn(
      "createInquiry: inquiries table is missing the structured columns — run supabase/migrations/2026-10-02-inquiries-structured.sql. Saving legacy shape.",
    );
    const retry = await db.from("inquiries").insert(stripExtendedColumns(data)).select("*").single();
    if (retry.error) throw retry.error;
    return retry.data as Inquiry;
  }
  throw first.error;
}

export type InquiryPatch = Partial<Pick<Inquiry, "status" | "assigned_to" | "notes">>;

export async function updateInquiry(id: string, patch: InquiryPatch): Promise<Inquiry | null> {
  if (!isSupabaseConfigured) return null;
  const clean: Record<string, unknown> = {};
  if (patch.status !== undefined) clean.status = patch.status;
  if (patch.assigned_to !== undefined) clean.assigned_to = patch.assigned_to || null;
  if (patch.notes !== undefined) clean.notes = patch.notes;
  if (Object.keys(clean).length === 0) return getInquiry(id);

  const db = supabaseAdmin();
  const first = await db.from("inquiries").update(clean).eq("id", id).select("*").maybeSingle();
  if (!first.error) return (first.data as Inquiry | null) ?? null;
  if (isUnknownColumnError(first.error) && "assigned_to" in clean) {
    delete clean.assigned_to;
    const retry = await db.from("inquiries").update(clean).eq("id", id).select("*").maybeSingle();
    if (retry.error) throw retry.error;
    return (retry.data as Inquiry | null) ?? null;
  }
  throw first.error;
}

export async function deleteInquiry(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  const { error, count } = await supabaseAdmin().from("inquiries").delete({ count: "exact" }).eq("id", id);
  if (error) throw error;
  return (count ?? 0) > 0;
}

// =================================================================
// ACTIVITY (audit log)
// =================================================================
export type ActivityRow = {
  id?: string;
  kind: string;
  entity?: string;
  actor?: string;
  summary?: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
};

export async function getRecentActivity(limit = 10): Promise<ActivityRow[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabaseAdmin()
    .from("activity")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as ActivityRow[];
}

export async function logActivity(row: ActivityRow): Promise<void> {
  if (!isSupabaseConfigured) return;
  await supabaseAdmin().from("activity").insert(row);
}
