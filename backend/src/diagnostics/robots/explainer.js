/**
 * Turns parsed robots.txt structure into plain-English explanations.
 *
 * Kept separate from parser.js so the "what does this mean in words" logic
 * can change/improve independently of the parsing grammar.
 */

/**
 * @param {ReturnType<import("./parser.js").parseRobotsTxt>} parsed
 * @returns {{
 *   groups: Array<{ userAgents: string[], summary: string, rules: Array<{ type: string, value: string, explanation: string }> }>,
 *   sitemaps: string[],
 *   overallSummary: string
 * }}
 */
export function explainRobotsTxt(parsed) {
  const explainedGroups = parsed.groups.map((group) => explainGroup(group));

  const overallSummary = buildOverallSummary(parsed, explainedGroups);

  return {
    groups: explainedGroups,
    sitemaps: parsed.sitemaps,
    overallSummary,
  };
}

function explainGroup(group) {
  const agentLabel = describeAgents(group.userAgents);

  const rules = group.rules.map((rule) => ({
    ...rule,
    explanation: explainRule(rule, agentLabel),
  }));

  const disallowCount = rules.filter((r) => r.type === "disallow" && r.value !== "").length;
  const allowCount = rules.filter((r) => r.type === "allow").length;
  const blanketDisallow = rules.some((r) => r.type === "disallow" && r.value === "/");
  const blanketAllowOnly = rules.length > 0 && rules.every((r) => r.type === "disallow" && r.value === "");

  const isPlural = group.userAgents.length > 1;
  let summary;
  if (blanketDisallow) {
    summary = `${agentLabel} ${isPlural ? "are" : "is"} blocked from crawling the entire site.`;
  } else if (blanketAllowOnly) {
    summary = `${agentLabel} ${isPlural ? "are" : "is"} allowed to crawl the entire site (no paths are blocked).`;
  } else if (disallowCount === 0 && allowCount === 0) {
    summary = `${agentLabel} ${isPlural ? "have" : "has"} no blocking path rules, only other directives (like crawl-delay).`;
  } else {
    summary = `${agentLabel} ${isPlural ? "have" : "has"} ${disallowCount} blocked path${disallowCount === 1 ? "" : "s"} and ${allowCount} explicitly allowed path${allowCount === 1 ? "" : "s"}.`;
  }

  return {
    userAgents: group.userAgents,
    summary,
    rules,
  };
}

function describeAgents(userAgents) {
  if (userAgents.length === 0) return "Unnamed crawlers";
  if (userAgents.includes("*")) {
    if (userAgents.length === 1) return "All crawlers (*)";
    const others = userAgents.filter((a) => a !== "*");
    return `All crawlers, and specifically ${others.join(", ")},`;
  }
  if (userAgents.length === 1) return `The "${userAgents[0]}" crawler`;
  return `The crawlers ${userAgents.map((a) => `"${a}"`).join(", ")}`;
}

function explainRule(rule, agentLabel) {
  switch (rule.type) {
    case "disallow":
      if (rule.value === "") {
        return `An empty Disallow means no restriction - ${agentLabel} may crawl everything under this rule.`;
      }
      if (rule.value === "/") {
        return `Blocks ${agentLabel} from crawling anything on the site (every URL starts with "/").`;
      }
      return `Blocks ${agentLabel} from crawling any URL ${describePathMatch(rule.value)}.`;
    case "allow":
      if (rule.value === "" || rule.value === "/") {
        return `Explicitly allows ${agentLabel} to crawl the whole site.`;
      }
      return `Explicitly allows ${agentLabel} to crawl URLs ${describePathMatch(rule.value)}, even if a broader Disallow rule would otherwise block them.`;
    case "crawl-delay":
      return `Asks ${agentLabel} to wait ${rule.value} second${rule.value === "1" ? "" : "s"} between requests to avoid overloading the server.`;
    case "host":
      return `Suggests "${rule.value}" as the preferred mirror/domain for this site.`;
    case "noindex":
      return `Requests that "${rule.value}" not be indexed (non-standard directive, not honored by most search engines via robots.txt).`;
    default:
      return `Custom directive "${rule.type}" with value "${rule.value}".`;
  }
}

function describePathMatch(value) {
  const endsAnchored = value.endsWith("$");
  const body = endsAnchored ? value.slice(0, -1) : value;
  const hasWildcard = body.includes("*");

  if (hasWildcard && endsAnchored) {
    return `matching the pattern "${value}" (with "*" as a wildcard, and the URL must end exactly there)`;
  }
  if (hasWildcard) {
    return `matching the pattern "${value}" ("*" acts as a wildcard for any characters)`;
  }
  if (endsAnchored) {
    return `that is exactly "${body}"`;
  }
  return `whose path starts with "${value}"`;
}

function buildOverallSummary(parsed, explainedGroups) {
  if (parsed.isEmpty) {
    return "The robots.txt file was found but contains no recognizable rules.";
  }

  const totalGroups = explainedGroups.length;
  const sitemapCount = parsed.sitemaps.length;
  const groupWord = totalGroups === 1 ? "rule group" : "rule groups";
  const sitemapPart = sitemapCount > 0 ? ` and lists ${sitemapCount} sitemap${sitemapCount === 1 ? "" : "s"}` : " and does not list any sitemaps";

  return `This robots.txt defines ${totalGroups} ${groupWord}${sitemapPart}.`;
}
