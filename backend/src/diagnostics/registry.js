import { runRobotsDiagnostic } from "./robots/index.js";

/**
 * Registry mapping a diagnostic's URL slug to its runner function.
 *
 * To add a new diagnostic later (e.g. security headers, sitemap
 * validation, SSL check), create a sibling folder under src/diagnostics/
 * with its own fetcher/parser/explainer-style modules, export a single
 * `run...Diagnostic(site)` function from its index.js, and register it here.
 * No changes to the route layer are needed.
 */
export const diagnosticsRegistry = {
  robots: runRobotsDiagnostic,
  // headers: runHeadersDiagnostic,
  // sitemap: runSitemapDiagnostic,
};

export function listAvailableDiagnostics() {
  return Object.keys(diagnosticsRegistry);
}
