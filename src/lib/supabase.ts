/**
 * Supabase clients.
 *
 * Two flavors:
 * - `supabaseAnon`: anon key, safe for the browser. Use for the public website's reads.
 * - `supabaseAdmin`: service role key, server-only. Use in API routes for admin writes.
 *
 * If env vars aren't set yet, `isSupabaseConfigured` returns false and the
 * data layer falls back to JSON files (see lib/data.ts). This lets the app
 * keep working in local dev before keys are pasted in.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

let _anon: SupabaseClient | null = null;
let _admin: SupabaseClient | null = null;

export function supabaseAnon(): SupabaseClient {
  if (!url || !anonKey) {
    throw new Error("Supabase anon client requested but env vars are missing.");
  }
  if (!_anon) {
    _anon = createClient(url, anonKey, { auth: { persistSession: false } });
  }
  return _anon;
}

export function supabaseAdmin(): SupabaseClient {
  if (!url || !serviceKey) {
    throw new Error("Supabase admin client requested but env vars are missing.");
  }
  if (!_admin) {
    _admin = createClient(url, serviceKey, { auth: { persistSession: false } });
  }
  return _admin;
}
