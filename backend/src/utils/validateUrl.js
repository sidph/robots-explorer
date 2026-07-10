/**
 * Validates and normalizes a user-supplied website URL.
 *
 * Kept dependency-free and side-effect-free so it can be reused by any
 * future diagnostic (security headers, sitemap checks, etc.) that also
 * needs "turn whatever the user typed into a safe origin URL".
 */

const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

/**
 * @param {string} rawInput - whatever the user typed, e.g. "example.com",
 *   "www.example.com/some/page", "https://example.com/"
 * @returns {{ ok: true, origin: string, hostname: string } | { ok: false, reason: string }}
 */
export function normalizeWebsiteUrl(rawInput) {
  if (typeof rawInput !== "string" || rawInput.trim().length === 0) {
    return { ok: false, reason: "Enter a website URL to check." };
  }

  let candidate = rawInput.trim();

  // If no protocol was supplied, assume https rather than rejecting outright.
  if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(candidate)) {
    candidate = `https://${candidate}`;
  }

  let parsed;
  try {
    parsed = new URL(candidate);
  } catch {
    return { ok: false, reason: "That doesn't look like a valid URL." };
  }

  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
    return { ok: false, reason: "Only http:// and https:// URLs are supported." };
  }

  if (!parsed.hostname || !parsed.hostname.includes(".")) {
    // Guards against things like "https://localhost" being treated as a
    // public website check, and catches obvious typos like "https://example".
    if (parsed.hostname !== "localhost") {
      return { ok: false, reason: "Enter a full domain, e.g. example.com" };
    }
  }

  return {
    ok: true,
    origin: `${parsed.protocol}//${parsed.host}`,
    hostname: parsed.hostname,
  };
}
