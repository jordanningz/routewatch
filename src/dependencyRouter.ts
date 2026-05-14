/**
 * dependencyRouter.ts
 * Express router exposing route dependency data via HTTP endpoints.
 */

import { Router, Request, Response } from "express";
import {
  addDependency,
  removeDependency,
  getDependencies,
  getAllDependencies,
  getTransitiveUpstream,
  clearDependenciesForRoute,
} from "./routeDependencies";

export function createDependencyRouter(): Router {
  const router = Router();

  // GET /dependencies — list all
  router.get("/", (_req: Request, res: Response) => {
    res.json(getAllDependencies());
  });

  // GET /dependencies/:route — get for a specific route (base64-encoded path)
  router.get("/:route", (req: Request, res: Response) => {
    const route = decodeURIComponent(req.params.route);
    res.json(getDependencies(route));
  });

  // GET /dependencies/:route/transitive — transitive upstream
  router.get("/:route/transitive", (req: Request, res: Response) => {
    const route = decodeURIComponent(req.params.route);
    const upstream = getTransitiveUpstream(route);
    res.json({ route, transitiveUpstream: upstream });
  });

  // POST /dependencies — add a dependency { route, dependsOn }
  router.post("/", (req: Request, res: Response) => {
    const { route, dependsOn } = req.body as { route?: string; dependsOn?: string };
    if (!route || !dependsOn) {
      return res.status(400).json({ error: "route and dependsOn are required" });
    }
    addDependency(route, dependsOn);
    res.status(201).json(getDependencies(route));
  });

  // DELETE /dependencies — remove a dependency { route, dependsOn }
  router.delete("/", (req: Request, res: Response) => {
    const { route, dependsOn } = req.body as { route?: string; dependsOn?: string };
    if (!route || !dependsOn) {
      return res.status(400).json({ error: "route and dependsOn are required" });
    }
    removeDependency(route, dependsOn);
    res.json(getDependencies(route));
  });

  // DELETE /dependencies/:route/all — clear all deps for a route
  router.delete("/:route/all", (req: Request, res: Response) => {
    const route = decodeURIComponent(req.params.route);
    clearDependenciesForRoute(route);
    res.json({ cleared: route });
  });

  return router;
}
