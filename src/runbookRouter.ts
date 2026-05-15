/**
 * runbookRouter.ts
 * Express router exposing runbook data via HTTP endpoints.
 */

import { Router, Request, Response } from "express";
import {
  setRunbook,
  getRunbook,
  removeRunbook,
  getAllRunbooks,
} from "./routeRunbook";

export function createRunbookRouter(): Router {
  const router = Router();

  // GET /runbooks — list all runbooks
  router.get("/", (_req: Request, res: Response) => {
    res.json(getAllRunbooks());
  });

  // GET /runbooks/:pattern — get runbook for a specific route pattern
  router.get("/:pattern", (req: Request, res: Response) => {
    const pattern = decodeURIComponent(req.params.pattern);
    const entry = getRunbook(pattern);
    if (!entry) {
      return res.status(404).json({ error: `No runbook found for "${pattern}"` });
    }
    res.json({ pattern, ...entry });
  });

  // PUT /runbooks/:pattern — create or update a runbook
  router.put("/:pattern", (req: Request, res: Response) => {
    const pattern = decodeURIComponent(req.params.pattern);
    const { url, summary, updatedBy } = req.body as {
      url?: string;
      summary?: string;
      updatedBy?: string;
    };
    if (!url) {
      return res.status(400).json({ error: "url is required" });
    }
    const entry = setRunbook(pattern, url, { summary, updatedBy });
    res.status(200).json({ pattern, ...entry });
  });

  // DELETE /runbooks/:pattern — remove a runbook
  router.delete("/:pattern", (req: Request, res: Response) => {
    const pattern = decodeURIComponent(req.params.pattern);
    const removed = removeRunbook(pattern);
    if (!removed) {
      return res.status(404).json({ error: `No runbook found for "${pattern}"` });
    }
    res.status(204).send();
  });

  return router;
}
