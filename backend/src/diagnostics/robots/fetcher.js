import { fetchWithTimeout, FetchTimeoutError, FetchNetworkError, TooManyRedirectsError } from "../../utils/httpClient.js";

/**
 * Fetches robots.txt for a given site origin.
 *
 * Deliberately contains NO parsing logic - its only job is "go get the
 * bytes (or explain why we couldn't)". Keeping this separate from
 * parser.js means the parser can be unit tested with plain strings and
 * reused if we ever need to parse a robots.txt uploaded by a user instead
 * of fetched over the network.
 *
 * @param {string} origin - e.g. "https://example.com"
 * @returns {Promise<
 *   | { exists: true, statusCode: number, finalUrl: string, redirected: boolean, content: string }
 *   | { exists: false, reason: "not_found" | "timeout" | "network_error" | "too_many_redirects" | "server_error", statusCode?: number, finalUrl?: string, message: string }
 * >}
 */
export async function fetchRobotsTxt(origin) {
  const robotsUrl = `${origin}/robots.txt`;

  try {
    const result = await fetchWithTimeout(robotsUrl, { timeoutMs: 8000 });

    if (result.status === 404 || result.status === 410) {
      return {
        exists: false,
        reason: "not_found",
        statusCode: result.status,
        finalUrl: result.finalUrl,
        message: "This site does not have a robots.txt file (server responded with 404).",
      };
    }

    if (result.status >= 200 && result.status < 300) {
      return {
        exists: true,
        statusCode: result.status,
        finalUrl: result.finalUrl,
        redirected: result.redirected,
        content: result.body,
      };
    }

    // Per convention (and Google's documented behavior), a robots.txt that
    // errors with a 5xx is treated as "temporarily unreachable", while other
    // 4xx codes are generally treated as "no rules / fully allowed", but we
    // surface the actual status so the UI can be transparent about it.
    if (result.status >= 500) {
      return {
        exists: false,
        reason: "server_error",
        statusCode: result.status,
        finalUrl: result.finalUrl,
        message: `The server returned a ${result.status} error when asked for robots.txt.`,
      };
    }

    return {
      exists: false,
      reason: "not_found",
      statusCode: result.status,
      finalUrl: result.finalUrl,
      message: `The server responded with status ${result.status} for robots.txt, which is treated as "no file".`,
    };
  } catch (err) {
    if (err instanceof FetchTimeoutError) {
      return { exists: false, reason: "timeout", message: "The request to fetch robots.txt timed out." };
    }
    if (err instanceof TooManyRedirectsError) {
      return { exists: false, reason: "too_many_redirects", message: "The site redirected too many times while looking for robots.txt." };
    }
    if (err instanceof FetchNetworkError) {
      return { exists: false, reason: "network_error", message: "Could not reach that site. Check the URL and try again." };
    }
    return { exists: false, reason: "network_error", message: "An unexpected error occurred while fetching robots.txt." };
  }
}
