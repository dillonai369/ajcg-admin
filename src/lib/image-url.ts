/**
 * Image URL helpers for the public site.
 *
 * `optimizedImage()` routes a raster image through Vercel's image optimizer
 * (`/_next/image`) so the browser receives a resized, WebP/AVIF-encoded copy
 * instead of whatever was uploaded. Measured 2026-10-26: the homepage carousel
 * was shipping two listing photos of 3.9 MB and 3.5 MB (raw PNGs uploaded by
 * the team) — 7.8 MB of a 12.4 MB page, mobile LCP 11.4 s. Through the
 * optimizer the same photos arrive at ~100 KB each. Nothing changes visually.
 *
 * Works for Supabase Storage URLs, the old website-builder CDN, and local
 * /assets paths; `next.config.js` must list each remote host.
 */

/** Widths Vercel's optimizer accepts by default (deviceSizes). Pick the next one up. */
const ALLOWED_WIDTHS = [640, 750, 828, 1080, 1200, 1920, 2048, 3840];

/**
 * Remote hosts the optimizer is allowed to fetch from — MUST mirror
 * `images.remotePatterns` in next.config.js. An unknown host is returned
 * untouched (the optimizer would answer 400 and the photo would vanish).
 */
const ALLOWED_HOST_RE = /^https:\/\/([a-z0-9-]+\.)*(supabase\.co|supabase\.in|lirp\.cdn-website\.com)$/i;

function remoteAllowed(u: string): boolean {
  if (u.startsWith("/")) return true; // local /public asset
  try {
    return ALLOWED_HOST_RE.test(new URL(u).origin);
  } catch {
    return false;
  }
}

export function normalizeImageUrl(url?: string | null): string {
  if (!url) return "";
  const u = url.trim();
  if (!u) return "";
  return u.startsWith("http") || u.startsWith("/") || u.startsWith("data:") ? u : `/${u}`;
}

/**
 * @param url     Raw image URL/path from the database or /public.
 * @param width   Target CSS width in px at 1x; snapped up to an allowed size.
 * @param quality 1–100, default 75.
 */
export function optimizedImage(url?: string | null, width = 1080, quality = 75): string {
  const u = normalizeImageUrl(url);
  if (!u) return "";
  // Leave SVGs, data URLs, GIFs (animation) and already-optimized URLs alone.
  if (/\.svg(\?|$)/i.test(u) || u.startsWith("data:") || /\.gif(\?|$)/i.test(u) || u.startsWith("/_next/image")) return u;
  if (!remoteAllowed(u)) return u;
  const w = ALLOWED_WIDTHS.find((x) => x >= width) ?? ALLOWED_WIDTHS[ALLOWED_WIDTHS.length - 1];
  return `/_next/image?url=${encodeURIComponent(u)}&w=${w}&q=${quality}`;
}

/** CSS `url('…')` with the single quote escaped — for inline backgroundImage styles. */
export function cssUrl(url: string): string {
  return `url('${url.replace(/'/g, "%27")}')`;
}
