/**
 * POST /api/ai
 *
 * Backs the AI-assist buttons in the blog and listing editors.
 * Expects: { action: "polish" | "expand" | "seo" | "describe-listing", input: string, context?: any }
 * Returns: { output: string }
 *
 * Gated to approved admin users only, and rate-limited per user, so this
 * endpoint can't be scripted to burn Anthropic credits.
 */
import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { requireApproved } from "@/lib/access";

// Claude Fable 5 — Anthropic's most capable generally-available model, per
// Dillon's standing preference to always use the top-tier model.
const MODEL = "claude-fable-5";

// Simple in-memory rate limit: max N generations per user per rolling window.
// Resets on cold start, which is fine — it exists to stop runaway loops, not
// to be a hardened quota. Keyed by the caller's email.
const RATE_LIMIT = 30;
const WINDOW_MS = 60_000;
const hits = new Map<string, number[]>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > RATE_LIMIT;
}

const SYSTEM_PROMPTS: Record<string, string> = {
  polish:
    "You are an editor for a Chicago multifamily real estate brokerage's blog. Take the user's draft and polish it: improve flow, tighten sentences, vary structure, keep the voice professional but human. Return the polished prose only — no commentary or framing.",
  expand:
    "You are a writer for a Chicago multifamily real estate brokerage. The user gives you bullet points or rough notes. Expand them into clean, well-structured paragraphs suitable for a blog post or marketing piece. Maintain a professional, knowledgeable voice. Return prose only.",
  seo:
    "Generate SEO meta title (max 60 chars) and meta description (max 160 chars) for this post. Return JSON: {\"title\": \"...\", \"description\": \"...\"}",
  "describe-listing":
    "You are writing marketing copy for a multifamily listing at AJ Commercial Group, a Chicago-area brokerage. Given the property facts, write a 100-150 word description that's informative, professional, and highlights value-add potential and neighborhood appeal. Return prose only.",
};

export async function POST(req: Request) {
  const gate = await requireApproved();
  if (gate.response) return gate.response;
  if (rateLimited(gate.user.email)) {
    return NextResponse.json(
      { error: "Rate limit reached — please wait a minute and try again." },
      { status: 429 },
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not set in .env.local. Add it and restart the dev server." },
      { status: 503 },
    );
  }

  let body: { action?: string; input?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const action = body.action ?? "polish";
  const input = (body.input ?? "").trim();

  if (!input) {
    return NextResponse.json({ error: "Missing 'input' field" }, { status: 400 });
  }

  const system = SYSTEM_PROMPTS[action] ?? SYSTEM_PROMPTS.polish;

  const client = new Anthropic({ apiKey });

  try {
    const resp = await client.messages.create({
      model: MODEL,
      max_tokens: 2048,
      system,
      messages: [{ role: "user", content: input }],
    });

    const textBlock = resp.content.find((b) => b.type === "text");
    const output = textBlock && textBlock.type === "text" ? textBlock.text : "";

    return NextResponse.json({ output });
  } catch (err: unknown) {
    // Log the real upstream error server-side; return a generic message so
    // Anthropic API internals never reach the browser.
    console.error("POST /api/ai — Claude request failed:", err);
    return NextResponse.json({ error: "AI request failed. Please try again." }, { status: 502 });
  }
}
