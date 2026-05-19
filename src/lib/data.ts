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
export async function getProperties(): Promise<Property[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabaseAdmin()
      .from("properties")
      .select("*")
      .order("sale_date", { ascending: false, nullsFirst: false });
    if (error) throw error;
    return (data ?? []) as Property[];
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
export async function getPosts(): Promise<Post[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabaseAdmin()
      .from("posts")
      .select("*")
      .order("published_at", { ascending: false, nullsFirst: false });
    if (error) throw error;
    return (data ?? []) as Post[];
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

export async function savePost(slug: string, data: Partial<Post>): Promise<Post | null> {
  if (isSupabaseConfigured) {
    const { slug: _ignore, id: _id, created_at: _ca, updated_at: _ua, ...patch } = data as Record<string, unknown>;
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
    const insert = {
      ...data,
      slug: data.slug,
      title: data.title ?? "Untitled Post",
      category: data.category ?? "Market Updates",
      status: data.status ?? "draft",
    };
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
export type Inquiry = {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  message?: string;
  source?: string;
  property_slug?: string;
  broker_slug?: string;
  status?: string;
  created_at?: string;
};

export async function getInquiries(): Promise<Inquiry[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabaseAdmin()
    .from("inquiries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []) as Inquiry[];
}

export async function createInquiry(data: Inquiry): Promise<Inquiry> {
  if (!isSupabaseConfigured) {
    // No-op in JSON mode (we don't persist inquiries to JSON)
    return data;
  }
  const { data: row, error } = await supabaseAdmin().from("inquiries").insert(data).select("*").single();
  if (error) throw error;
  return row as Inquiry;
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
