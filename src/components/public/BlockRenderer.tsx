import Link from "next/link";
import type { ReactNode } from "react";
import type { PostBlock } from "@/lib/types";

/**
 * Public renderer for the block-based blog body produced by BlockEditor.
 *
 * Design notes:
 * - Server component (no client JS) — pure markup, good for SEO + speed.
 * - Paragraph / list / heading / quote text supports a SAFE inline subset:
 *   [label](/path or https://url) links and **bold**. Parsed into React nodes,
 *   never dangerouslySetInnerHTML, so there's no XSS surface even though the
 *   text ultimately comes from the DB. This is what lets authored posts carry
 *   the internal links that SEO depends on.
 * - Matches the public site's existing CSS classes so it looks native.
 */

function normalizeImg(url?: string) {
  if (!url) return "";
  return url.startsWith("http") || url.startsWith("/") ? url : `/${url}`;
}

/** Parse a safe inline subset: [label](url) links and **bold**. */
function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  // Alternate between link and bold matches, whichever comes first.
  const pattern = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = pattern.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    if (m[1] !== undefined) {
      const label = m[1];
      const href = m[2];
      if (href.startsWith("/")) {
        nodes.push(
          <Link key={`${keyPrefix}-l${i}`} href={href}>
            {label}
          </Link>,
        );
      } else {
        nodes.push(
          <a key={`${keyPrefix}-l${i}`} href={href} target="_blank" rel="noopener noreferrer">
            {label}
          </a>,
        );
      }
    } else if (m[3] !== undefined) {
      nodes.push(<strong key={`${keyPrefix}-b${i}`}>{m[3]}</strong>);
    }
    last = pattern.lastIndex;
    i++;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function youtubeVimeoEmbed(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{6,})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return null;
}

function Block({ block, idx }: { block: PostBlock; idx: number }) {
  const key = `b${idx}`;
  switch (block.type) {
    case "paragraph":
      if (!block.text?.trim()) return null;
      return <p style={{ marginBottom: 20, lineHeight: 1.75 }}>{renderInline(block.text, key)}</p>;

    case "heading":
      if (!block.text?.trim()) return null;
      return (
        <h2 style={{ marginTop: 40, marginBottom: 16 }}>{renderInline(block.text, key)}</h2>
      );

    case "list": {
      const items = (block.text || "")
        .split("\n")
        .map((l) => l.replace(/^\s*[•\-*]\s*/, "").trim())
        .filter(Boolean);
      if (!items.length) return null;
      return (
        <ul className="feature-list" style={{ marginBottom: 24 }}>
          {items.map((it, i) => (
            <li key={i}>
              <span className="check">✓</span>
              <span>{renderInline(it, `${key}-${i}`)}</span>
            </li>
          ))}
        </ul>
      );
    }

    case "quote":
      if (!block.text?.trim()) return null;
      return (
        <blockquote
          style={{
            borderLeft: "3px solid var(--gold, #c9a24a)",
            paddingLeft: 20,
            margin: "28px 0",
            fontStyle: "italic",
            fontSize: 20,
          }}
        >
          {renderInline(block.text, key)}
          {block.attribution ? (
            <footer style={{ marginTop: 8, fontSize: 14, fontStyle: "normal", opacity: 0.7 }}>
              — {block.attribution}
            </footer>
          ) : null}
        </blockquote>
      );

    case "image": {
      const src = normalizeImg(block.url);
      if (!src) return null;
      return (
        <figure style={{ margin: "28px 0" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={block.caption || ""}
            loading="lazy"
            style={{ width: "100%", borderRadius: "var(--radius, 8px)", display: "block" }}
          />
          {block.caption ? (
            <figcaption style={{ marginTop: 8, fontSize: 13, opacity: 0.65, textAlign: "center" }}>
              {block.caption}
            </figcaption>
          ) : null}
        </figure>
      );
    }

    case "gallery": {
      const imgs = (block.images || []).map(normalizeImg).filter(Boolean);
      if (!imgs.length) return null;
      return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, margin: "28px 0" }}>
          {imgs.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={src} alt="" loading="lazy" style={{ width: "100%", borderRadius: 8, objectFit: "cover", aspectRatio: "4/3" }} />
          ))}
        </div>
      );
    }

    case "video": {
      const embed = block.url ? youtubeVimeoEmbed(block.url) : null;
      if (!embed) return null;
      return (
        <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, margin: "28px 0" }}>
          <iframe
            src={embed}
            title="Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0, borderRadius: 8 }}
          />
        </div>
      );
    }

    case "divider":
      return <hr style={{ margin: "36px 0", border: 0, borderTop: "1px solid var(--line, #e5e7eb)" }} />;

    case "cta": {
      const href = block.url || "/contact";
      const label = block.text || "Get in touch";
      const inner = (
        <span className="btn btn-primary btn-arrow" style={{ padding: "16px 28px", justifyContent: "center" }}>
          {label}
        </span>
      );
      return (
        <div style={{ margin: "32px 0", textAlign: "center" }}>
          {href.startsWith("/") ? <Link href={href}>{inner}</Link> : <a href={href}>{inner}</a>}
        </div>
      );
    }

    default:
      return null;
  }
}

export default function BlockRenderer({ blocks }: { blocks?: PostBlock[] }) {
  if (!blocks || blocks.length === 0) return null;
  return (
    <div className="article-body" style={{ fontSize: 17 }}>
      {blocks.map((b, i) => (
        <Block key={b.id || i} block={b} idx={i} />
      ))}
    </div>
  );
}
