import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import { diagnosticsRouter } from "./routes/diagnostics.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/diagnostics", diagnosticsRouter);

  // In production the frontend is built and copied to backend/public by the
  // Dockerfile, so the same service can serve both the API and the SPA.
  const frontendDist = path.join(__dirname, "..", "public");
  if (fs.existsSync(frontendDist)) {
    app.use(express.static(frontendDist));
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api/")) return next();
      res.sendFile(path.join(frontendDist, "index.html"));
    });
  }

  app.use("/api", notFoundHandler);
  app.use(errorHandler);

  return app;
}
