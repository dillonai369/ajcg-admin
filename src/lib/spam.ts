/**
 * Shared bot / spam screening for the public lead endpoints.
 *
 * Why this exists: `/api/lead` (the GoHighLevel relay) had honeypot and
 * time-on-page checks, but `/api/inquiries` — which is what actually writes a
 * row into the admin's inbox — had none. It accepted any POST with a `name`
 * field, from anyone, unlimited. That is how junk leads were landing in the
 * client's dashboard: a bot doesn't need to use the form at all, it can hit
 * the JSON endpoint directly.
 *
 * The checks are deliberately ordered cheapest-first, and each one is
 * conservative — a false positive means a real prospect is silently dropped,
 * which is worse than a little junk. Every drop is logged with its reason so
 * the heuristics can be reviewed against real traffic.
 */

/** Submissions faster than this after page load are automated. */
const MIN_FORM_FILL_MS = 2000;

/** Per-IP submission cap, to stop a single source flooding the inbox. */
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

const hits = new Map<string, number[]>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);

  // Bound memory: this Map lives for the lifetime of a serverless instance.
  if (hits.size > 5000) {
    for (const [k, times] of hits) {
      if (times.every((t) => now - t >= RATE_LIMIT_WINDOW_MS)) hits.delete(k);
    }
  }
  return recent.length > RATE_LIMIT_MAX;
}

// Two copies on purpose: a global regex used with .test() remembers lastIndex
// between calls and silently skips matches on the next request.
const URL_RE_ALL = /\b(?:https?:\/\/|www\.)\S+/gi;
const URL_RE = /\b(?:https?:\/\/|www\.)\S+/i;
const BBCODE_RE = /\[url[=\]]|\[\/url\]|<a\s+href=/i;

/**
 * Phrases that essentially never appear in a genuine inquiry about buying or
 * selling an apartment building, but dominate contact-form spam.
 */
const SPAM_PHRASES = [
  "seo service",
  "seo servic",
  "backlink",
  "guest post",
  "link building",
  "web design service",
  "crypto",
  "bitcoin",
  "forex",
  "casino",
  "viagra",
  "cialis",
  "porn",
  "escort",
  "loan offer",
  "increase your traffic",
  "rank #1",
  "rank number 1",
  "digital marketing agency",
  "outsourcing",
  "hire developers",
  "lead generation service",
];

export type SpamVerdict = { spam: false } | { spam: true; reason: string };

export type SpamCheckInput = {
  /** Honeypot field — hidden from humans, auto-filled by bots. */
  honeypot?: unknown;
  /** Milliseconds between the form mounting and submit, measured on the client. */
  formElapsedMs?: unknown;
  /** Legacy: absolute client timestamp (ms) when the form mounted. */
  formLoadedAt?: unknown;
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  /** Client IP, for rate limiting. Pass null to skip the rate-limit check. */
  ip?: string | null;
};

/**
 * Time-on-page check. Prefers the client-measured elapsed time (immune to a
 * wrong device clock); falls back to the legacy absolute timestamp, ignoring
 * negative differences so a fast clock can never get a real person flagged.
 * Absent signals never block — only an affirmative "too fast" does.
 */
function tooFast(formElapsedMs: unknown, formLoadedAt: unknown): boolean {
  const elapsed = parseInt(String(formElapsedMs ?? ""), 10);
  if (Number.isFinite(elapsed)) return elapsed >= 0 && elapsed < MIN_FORM_FILL_MS;
  const loadedAt = parseInt(String(formLoadedAt ?? ""), 10);
  if (!Number.isFinite(loadedAt) || loadedAt <= 0) return false;
  const diff = Date.now() - loadedAt;
  return diff >= 0 && diff < MIN_FORM_FILL_MS;
}

export function screenSubmission(input: SpamCheckInput): SpamVerdict {
  const { honeypot, formElapsedMs, formLoadedAt, ip } = input;
  const name = (input.name ?? "").trim();
  const email = (input.email ?? "").trim();
  const phone = (input.phone ?? "").trim();
  const message = (input.message ?? "").trim();

  // 1. Honeypot: any value at all means it wasn't a human.
  if (honeypot && String(honeypot).trim().length > 0) {
    return { spam: true, reason: "honeypot" };
  }

  // 2. Time on page.
  if (tooFast(formElapsedMs, formLoadedAt)) {
    return { spam: true, reason: "too_fast" };
  }

  // 3. A lead with no way to reach them is useless to the brokers and is the
  //    signature of a script probing the endpoint.
  if (!email && !phone) {
    return { spam: true, reason: "no_contact_method" };
  }

  // 4. Malformed email. Cheap structural check only — no deliverability guess.
  if (email && !/^[^\s@]+@[^\s@,]+\.[a-z]{2,}$/i.test(email)) {
    return { spam: true, reason: "invalid_email" };
  }

  // 5. Links in the name field are always spam; links in the message are only
  //    suspicious in volume (a real seller might paste one listing URL).
  if (URL_RE.test(name) || BBCODE_RE.test(name)) {
    return { spam: true, reason: "url_in_name" };
  }
  const urlCount = (message.match(URL_RE_ALL) ?? []).length;
  if (urlCount >= 2 || BBCODE_RE.test(message)) {
    return { spam: true, reason: "links_in_message" };
  }

  // 6. Known solicitation vocabulary.
  const haystack = `${name} ${message}`.toLowerCase();
  const phrase = SPAM_PHRASES.find((p) => haystack.includes(p));
  if (phrase) {
    return { spam: true, reason: `phrase:${phrase}` };
  }

  // 7. Flood control, last because it mutates state.
  if (ip && rateLimited(ip)) {
    return { spam: true, reason: "rate_limited" };
  }

  return { spam: false };
}

/**
 * Lighter screen for auxiliary public endpoints (file uploads) that have no
 * name/email/message to inspect: honeypot, time-on-page, and flood control.
 */
export function screenBasic(
  input: Pick<SpamCheckInput, "honeypot" | "formElapsedMs" | "formLoadedAt" | "ip">,
): SpamVerdict {
  if (input.honeypot && String(input.honeypot).trim().length > 0) {
    return { spam: true, reason: "honeypot" };
  }
  if (tooFast(input.formElapsedMs, input.formLoadedAt)) {
    return { spam: true, reason: "too_fast" };
  }
  if (input.ip && rateLimited(`upload:${input.ip}`)) {
    return { spam: true, reason: "rate_limited" };
  }
  return { spam: false };
}

/** Extracts the originating client IP from Vercel's forwarding headers. */
export function clientIpFrom(headers: Headers): string | null {
  return (headers.get("x-forwarded-for") || "").split(",")[0].trim() || null;
}
