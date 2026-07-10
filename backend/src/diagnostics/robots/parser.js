/**
 * Pure parser for robots.txt content.
 *
 * Deliberately has zero knowledge of HTTP, Express, or anything else -
 * it takes a string and returns structured data. This makes it trivial to
 * unit test and safe to reuse (e.g. if a future feature lets a user paste
 * or upload a robots.txt file directly instead of fetching it).
 *
 * Grammar reference: https://www.rfc-editor.org/rfc/rfc9309
 */

const DIRECTIVE_ALIASES = {
  "user-agent": "user-agent",
  "disallow": "disallow",
  "allow": "allow",
  "sitemap": "sitemap",
  "crawl-delay": "crawl-delay",
  "host": "host",
  "noindex": "noindex", // non-standard but seen in the wild
};

/**
 * @param {string} content - raw robots.txt file contents
 * @returns {{
 *   groups: Array<{ userAgents: string[], rules: Array<{ type: string, value: string, raw: string }> }>,
 *   sitemaps: string[],
 *   unknownLines: string[],
 *   isEmpty: boolean
 * }}
 */
export function parseRobotsTxt(content) {
  const lines = (content || "").split(/\r\n|\r|\n/);

  const groups = [];
  const sitemaps = [];
  const unknownLines = [];

  let currentGroup = null;
  // Tracks whether the group currently being built has already received a
  // rule line, so a subsequent "User-agent:" knows to start a new group
  // rather than adding to the same one (this is how robots.txt distinguishes
  // "these two agents share one rule set" from "here's a second, separate rule set").
  let currentGroupHasRules = false;

  for (const rawLine of lines) {
    const line = stripComment(rawLine).trim();
    if (line.length === 0) continue;

    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) {
      unknownLines.push(rawLine.trim());
      continue;
    }

    const fieldRaw = line.slice(0, separatorIndex).trim().toLowerCase();
    const value = line.slice(separatorIndex + 1).trim();
    const directive = DIRECTIVE_ALIASES[fieldRaw];

    if (!directive) {
      unknownLines.push(rawLine.trim());
      continue;
    }

    if (directive === "sitemap") {
      if (value) sitemaps.push(value);
      continue;
    }

    if (directive === "user-agent") {
      if (currentGroup === null || currentGroupHasRules) {
        currentGroup = { userAgents: [], rules: [] };
        groups.push(currentGroup);
        currentGroupHasRules = false;
      }
      if (value) currentGroup.userAgents.push(value);
      continue;
    }

    // Any other directive (disallow/allow/crawl-delay/host/noindex) applies
    // to the current group. If a rule shows up before any User-agent line,
    // treat it as applying to a default "*" group per common real-world behavior.
    if (currentGroup === null) {
      currentGroup = { userAgents: ["*"], rules: [] };
      groups.push(currentGroup);
    }
    currentGroup.rules.push({ type: directive, value, raw: rawLine.trim() });
    currentGroupHasRules = true;
  }

  return {
    groups,
    sitemaps,
    unknownLines,
    isEmpty: groups.length === 0 && sitemaps.length === 0,
  };
}

function stripComment(line) {
  const hashIndex = line.indexOf("#");
  return hashIndex === -1 ? line : line.slice(0, hashIndex);
}
