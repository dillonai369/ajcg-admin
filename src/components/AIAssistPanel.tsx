"use client";

import { useState } from "react";
import { Sparkles, Wand2, Expand, Search, Link as LinkIcon, MessageSquare } from "lucide-react";

async function callAI(action: string, input: string): Promise<string> {
  const r = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, input }),
  });
  if (!r.ok) {
    let err: { error?: string } = {};
    try { err = await r.json(); } catch {}
    throw new Error(err.error || `AI request failed (${r.status})`);
  }
  const { output } = (await r.json()) as { output: string };
  return output;
}

/**
 * Used inside the listing editor — sits below the description field.
 * Reads the current value and offers to polish/expand it via Claude.
 */
export function AIInlineAssist({
  title = "Generate with Claude",
  subtitle = "Paste bullet points → polished marketing copy.",
  getInput,
  onResult,
  defaultAction = "describe-listing",
}: {
  title?: string;
  subtitle?: string;
  getInput?: () => string;
  onResult?: (output: string) => void;
  defaultAction?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function go() {
    setErr(null);
    const input = (getInput?.() || "").trim();
    if (!input) {
      setErr("Type a few bullet points in the field above first, then click Generate.");
      return;
    }
    setBusy(true);
    try {
      const out = await callAI(defaultAction, input);
      onResult?.(out);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="ai-glow rounded-lg p-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5" style={{ color: "var(--gold)" }} />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium">{title}</div>
          <div className="text-xs text-slate-600">{subtitle}</div>
        </div>
        <button
          type="button"
          onClick={go}
          disabled={busy}
          className="ai-btn text-xs px-3 py-2 rounded-lg font-medium flex items-center gap-1.5 disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5" /> {busy ? "Generating…" : "Generate"}
        </button>
      </div>
      {err ? <div className="text-xs text-red-600 mt-2">{err}</div> : null}
    </div>
  );
}

/**
 * Blog editor AI panel — multiple action buttons.
 */
export function AIBlogPanel({
  getBody,
  getTitle,
  getExcerpt,
  onBodyResult,
  onMetaResult,
}: {
  getBody?: () => string;
  getTitle?: () => string;
  getExcerpt?: () => string;
  onBodyResult?: (text: string) => void;
  onMetaResult?: (meta: { title?: string; description?: string }) => void;
} = {}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function run(action: "polish" | "expand" | "seo", buttonLabel: string) {
    setErr(null);
    setBusy(buttonLabel);
    try {
      const body = getBody?.() || "";
      const input =
        action === "seo"
          ? `Title: ${getTitle?.() || ""}\nExcerpt: ${getExcerpt?.() || ""}\nBody:\n${body}`
          : body;
      if (!input.trim()) {
        throw new Error("Write some content first, then click an AI action.");
      }
      const out = await callAI(action, input);
      if (action === "seo") {
        try {
          const parsed = JSON.parse(out);
          onMetaResult?.(parsed);
        } catch {
          onMetaResult?.({ description: out });
        }
      } else {
        onBodyResult?.(out);
      }
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="ai-glow rounded-lg p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center">
          <Sparkles className="w-5 h-5" style={{ color: "var(--gold)" }} />
        </div>
        <div>
          <div className="text-sm font-semibold">Claude assist</div>
          <div className="text-xs text-slate-600">
            Polish prose, expand bullets, or generate SEO meta from your content.
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => run("polish", "polish")}
          disabled={!!busy}
          className="ai-btn text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 disabled:opacity-50"
        >
          <Wand2 className="w-3.5 h-3.5" /> {busy === "polish" ? "Polishing…" : "Polish prose"}
        </button>
        <button
          type="button"
          onClick={() => run("expand", "expand")}
          disabled={!!busy}
          className="ai-btn text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 disabled:opacity-50"
        >
          <Expand className="w-3.5 h-3.5" /> {busy === "expand" ? "Expanding…" : "Expand bullets"}
        </button>
        <button
          type="button"
          onClick={() => run("seo", "seo")}
          disabled={!!busy}
          className="ai-btn text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 disabled:opacity-50"
        >
          <Search className="w-3.5 h-3.5" /> {busy === "seo" ? "Generating…" : "Generate SEO meta"}
        </button>
        <button
          type="button"
          disabled
          className="ai-btn text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 opacity-40 cursor-not-allowed"
          title="Coming soon"
        >
          <LinkIcon className="w-3.5 h-3.5" /> Suggest links
        </button>
        <button
          type="button"
          disabled
          className="ai-btn text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 opacity-40 cursor-not-allowed"
          title="Coming soon"
        >
          <MessageSquare className="w-3.5 h-3.5" /> Draft from transcript
        </button>
      </div>
      {err ? <div className="text-xs text-red-600 mt-3">{err}</div> : null}
    </div>
  );
}
