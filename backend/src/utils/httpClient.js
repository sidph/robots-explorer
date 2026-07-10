/**
 * A small fetch wrapper shared by every diagnostic module.
 *
 * Centralizing timeout + redirect + error normalization here means new
 * diagnostics (security headers, sitemap validation, etc.) don't have to
 * re-solve "what if the request hangs" or "what if it redirects forever".
 */

const DEFAULT_TIMEOUT_MS = 8000;
const MAX_REDIRECTS = 5;

export class FetchTimeoutError extends Error {
  constructor(url) {
    super(`Request to ${url} timed out`);
    this.name = "FetchTimeoutError";
  }
}

export class FetchNetworkError extends Error {
  constructor(url, cause) {
    super(`Network error fetching ${url}`);
    this.name = "FetchNetworkError";
    this.cause = cause;
  }
}

export class TooManyRedirectsError extends Error {
  constructor(url) {
    super(`Too many redirects while fetching ${url}`);
    this.name = "TooManyRedirectsError";
  }
}

/**
 * Fetches a URL, manually following redirects (up to MAX_REDIRECTS) so the
 * caller always learns the final URL that actually answered the request.
 *
 * @param {string} url
 * @param {{ timeoutMs?: number, headers?: Record<string,string> }} [options]
 * @returns {Promise<{ status: number, finalUrl: string, headers: Headers, body: string, redirected: boolean }>}
 */
export async function fetchWithTimeout(url, options = {}) {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  let currentUrl = url;
  let redirected = false;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    let response;
    try {
      response = await fetch(currentUrl, {
        redirect: "manual",
        signal: controller.signal,
        headers: {
          "User-Agent": "RobotsExplorerBot/1.0 (+https://robots-explorer.example)",
          ...(options.headers || {}),
        },
      });
    } catch (err) {
      if (err.name === "AbortError") {
        throw new FetchTimeoutError(currentUrl);
      }
      throw new FetchNetworkError(currentUrl, err);
    } finally {
      clearTimeout(timer);
    }

    const isRedirect = response.status >= 300 && response.status < 400;
    if (isRedirect) {
      const location = response.headers.get("location");
      if (!location) {
        // Redirect status with no Location header - treat as final response.
        const body = await safeReadText(response);
        return { status: response.status, finalUrl: currentUrl, headers: response.headers, body, redirected };
      }
      currentUrl = new URL(location, currentUrl).toString();
      redirected = true;
      continue;
    }

    const body = await safeReadText(response);
    return { status: response.status, finalUrl: currentUrl, headers: response.headers, body, redirected };
  }

  throw new TooManyRedirectsError(url);
}

async function safeReadText(response) {
  try {
    return await response.text();
  } catch {
    return "";
  }
}
