export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "??";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function formatPhone(raw: string): string {
  return raw || "";
}

export function statusPillVariant(status: string): "green" | "amber" | "blue" | "gray" | "red" | "purple" {
  const s = (status || "").toLowerCase();
  if (s === "sold") return "gray";
  if (s === "for sale" || s === "active" || s === "published") return "green";
  if (s === "under contract" || s === "pending" || s === "draft") return "amber";
  if (s === "coming soon") return "blue";
  if (s === "scheduled") return "purple";
  return "gray";
}

export function statusLabel(status: string): string {
  const s = (status || "").toLowerCase();
  if (s === "sold") return "SOLD";
  if (s === "for sale" || s === "active") return "FOR SALE";
  if (s === "under contract" || s === "pending") return "UNDER CONTRACT";
  if (s === "coming soon") return "COMING SOON";
  if (s === "draft") return "DRAFT";
  return (status || "").toUpperCase();
}

// Build a usable image src for hero/gallery photos.
// Data has either:
//   - full http(s) URLs (e.g. lirp.cdn-website.com property photos) → use as-is
//   - relative "assets/..." paths (broker photos, some property photos) → served from public/
//   - data: URLs (uploaded base64) → use as-is
export function resolveImageUrl(src: string | undefined | null): string {
  if (!src) return "";
  if (src.startsWith("data:")) return src;
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  if (src.startsWith("/")) return src;
  // "assets/team/joey-hero.jpg" → "/assets/team/joey-hero.jpg" (public folder)
  return `/${src}`;
}
