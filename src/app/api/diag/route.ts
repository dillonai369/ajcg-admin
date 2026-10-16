// TEMPORARY diagnostic — preview branch only, removed before merge.
// Times the same Supabase list query several ways from inside the Vercel
// function, to find why /rest/v1/properties takes ~1.2s here but ~0.2s from a
// browser. Returns timings only, never row data.
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const COLS =
  "id,slug,page_slug,name,location,address,city,state,zip,neighborhood,submarket,units,type,status,description,hero_image,images,total_sqft,lot_size,year_built,year_renovated,stories,building_class,parking,heating,sale_price,sale_date,cap_rate,noi,gross_income,hide_sale_price,highlights,broker_slugs,feature_on_homepage,show_in_sold_carousel,canonical_url,meta_title,meta_description,created_at,updated_at";

async function timed<T>(label: string, fn: () => Promise<T>) {
  const t0 = Date.now();
  let note = "";
  try {
    const r = (await fn()) as unknown as { length?: number; bytes?: number };
    note = r && typeof r === "object" && "bytes" in r ? `${r.bytes} bytes` : Array.isArray(r) ? `${r.length} rows` : "";
  } catch (e) {
    note = `ERR ${(e as Error).message.slice(0, 80)}`;
  }
  return { label, ms: Date.now() - t0, note };
}

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get("k") !== "ajcg-diag-7f3a") {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const sb = supabaseAdmin();

  const raw = async (path: string, k: string, init: RequestInit = {}) => {
    const r = await fetch(`${url}/rest/v1/${path}`, {
      ...init,
      headers: { apikey: k, Authorization: `Bearer ${k}`, ...(init.headers || {}) },
    });
    const txt = await r.text();
    return { bytes: txt.length, enc: r.headers.get("content-encoding") };
  };

  const out = [];
  out.push(await timed("sbjs select cols + order (what the site does)", async () => (await sb.from("properties").select(COLS).order("created_at", { ascending: false, nullsFirst: false })).data));
  out.push(await timed("sbjs select cols, no order", async () => (await sb.from("properties").select(COLS)).data));
  out.push(await timed("sbjs select *, no order", async () => (await sb.from("properties").select("*")).data));
  out.push(await timed("sbjs single row", async () => (await sb.from("properties").select("*").eq("slug", "5-n-grant-st-westmont-il").maybeSingle()).data));
  out.push(await timed("sbjs posts list", async () => (await sb.from("posts").select("slug,title")).data));
  out.push(await timed("raw fetch service-role, cols+order", () => raw(`properties?select=${COLS}&order=created_at.desc.nullslast`, key)));
  out.push(await timed("raw fetch service-role, cols+order, cache:no-store", () => raw(`properties?select=${COLS}&order=created_at.desc.nullslast`, key, { cache: "no-store" })));
  out.push(await timed("raw fetch ANON key, cols+order", () => raw(`properties?select=${COLS}&order=created_at.desc.nullslast`, anon)));
  out.push(await timed("raw fetch service-role, select=slug only", () => raw(`properties?select=slug`, key)));
  out.push(await timed("raw fetch service-role, cols+order (2nd call, warm conn)", () => raw(`properties?select=${COLS}&order=created_at.desc.nullslast`, key)));

  return NextResponse.json({ region: process.env.VERCEL_REGION, node: process.version, results: out });
}
