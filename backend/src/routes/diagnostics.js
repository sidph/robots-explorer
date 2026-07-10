import { Router } from "express";
import { normalizeWebsiteUrl } from "../utils/validateUrl.js";
import { diagnosticsRegistry, listAvailableDiagnostics } from "../diagnostics/registry.js";

export const diagnosticsRouter = Router();

/**
 * GET /api/diagnostics — lists which diagnostics are available.
 * Lets the frontend (or any client) discover new diagnostics as they're
 * added, without hardcoding a list.
 */
diagnosticsRouter.get("/", (req, res) => {
  res.json({ available: listAvailableDiagnostics() });
});

/**
 * GET /api/diagnostics/:type?url=https://example.com
 *
 * This route stays intentionally thin: validate input, look up the
 * diagnostic in the registry, call it, and shape errors. All actual
 * fetching/parsing/explaining logic lives in src/diagnostics/<type>/.
 */
diagnosticsRouter.get("/:type", async (req, res, next) => {
  try {
    const { type } = req.params;
    const runDiagnostic = diagnosticsRegistry[type];

    if (!runDiagnostic) {
      return res.status(404).json({
        error: "unknown_diagnostic",
        message: `Unknown diagnostic "${type}". Available: ${listAvailableDiagnostics().join(", ")}`,
      });
    }

    const rawUrl = req.query.url;
    const validation = normalizeWebsiteUrl(rawUrl);

    if (!validation.ok) {
      return res.status(400).json({ error: "invalid_url", message: validation.reason });
    }

    const result = await runDiagnostic({ origin: validation.origin, hostname: validation.hostname });
    res.json(result);
  } catch (err) {
    next(err);
  }
});
