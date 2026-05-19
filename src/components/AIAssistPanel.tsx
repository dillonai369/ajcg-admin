import { Sparkles, Wand2, Expand, Search, Link as LinkIcon, MessageSquare } from "lucide-react";

export function AIInlineAssist({
  title = "Generate with Claude",
  subtitle = "Paste bullet points → polished marketing copy.",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="ai-glow rounded-lg p-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
        <Sparkles className="w-5 h-5" style={{ color: "var(--gold)" }} />
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-slate-600">{subtitle}</div>
      </div>
      <button
        type="button"
        className="ai-btn text-xs px-3 py-2 rounded-lg font-medium flex items-center gap-1.5"
      >
        <Sparkles className="w-3.5 h-3.5" /> Generate
      </button>
    </div>
  );
}

export function AIBlogPanel() {
  return (
    <div className="ai-glow rounded-lg p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center">
          <Sparkles className="w-5 h-5" style={{ color: "var(--gold)" }} />
        </div>
        <div>
          <div className="text-sm font-semibold">Claude Opus 4.7 assist</div>
          <div className="text-xs text-slate-600">
            Polish prose, draft full sections, generate SEO meta, or suggest internal links.
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="ai-btn text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5">
          <Wand2 className="w-3.5 h-3.5" /> Polish selection
        </button>
        <button type="button" className="ai-btn text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5">
          <Expand className="w-3.5 h-3.5" /> Expand bullets
        </button>
        <button type="button" className="ai-btn text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5" /> Generate SEO meta
        </button>
        <button type="button" className="ai-btn text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5">
          <LinkIcon className="w-3.5 h-3.5" /> Suggest internal links
        </button>
        <button type="button" className="ai-btn text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5" /> Draft from transcript
        </button>
      </div>
    </div>
  );
}
