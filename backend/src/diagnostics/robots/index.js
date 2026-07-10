import { fetchRobotsTxt } from "./fetcher.js";
import { parseRobotsTxt } from "./parser.js";
import { explainRobotsTxt } from "./explainer.js";

/**
 * Runs the full "robots.txt" diagnostic for a normalized site origin.
 *
 * This is the one function the route layer calls. It's the "public API"
 * of this diagnostic module - fetcher/parser/explainer are internal details
 * that could be swapped out without touching the route.
 *
 * @param {{ origin: string, hostname: string }} site
 * @returns {Promise<object>} JSON-serializable diagnostic result
 */
export async function runRobotsDiagnostic(site) {
  const fetchResult = await fetchRobotsTxt(site.origin);

  if (!fetchResult.exists) {
    return {
      diagnostic: "robots",
      site: site.origin,
      robotsUrl: `${site.origin}/robots.txt`,
      exists: false,
      reason: fetchResult.reason,
      message: fetchResult.message,
      statusCode: fetchResult.statusCode ?? null,
      groups: [],
      sitemaps: [],
      overallSummary: fetchResult.message,
    };
  }

  const parsed = parseRobotsTxt(fetchResult.content);
  const explained = explainRobotsTxt(parsed);

  return {
    diagnostic: "robots",
    site: site.origin,
    robotsUrl: fetchResult.finalUrl,
    exists: true,
    redirected: fetchResult.redirected,
    statusCode: fetchResult.statusCode,
    groups: explained.groups,
    sitemaps: explained.sitemaps,
    overallSummary: explained.overallSummary,
    unknownLines: parsed.unknownLines,
    rawContent: fetchResult.content,
  };
}
