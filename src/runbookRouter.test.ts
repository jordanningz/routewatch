import express, { Express } from "express";
import request from "supertest";
import { createRunbookRouter } from "./runbookRouter";
import { resetRunbooks, setRunbook } from "./routeRunbook";

function buildRunbookApp(): Express {
  const app = express();
  app.use(express.json());
  app.use("/runbooks", createRunbookRouter());
  return app;
}

beforeEach(() => resetRunbooks());

describe("GET /runbooks", () => {
  it("returns empty object when no runbooks exist", async () => {
    const res = await request(buildRunbookApp()).get("/runbooks");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({});
  });

  it("returns all runbooks", async () => {
    setRunbook("GET /users", "https://wiki.example.com/users");
    const res = await request(buildRunbookApp()).get("/runbooks");
    expect(res.status).toBe(200);
    expect(res.body["GET /users"].url).toBe("https://wiki.example.com/users");
  });
});

describe("GET /runbooks/:pattern", () => {
  it("returns 404 for unknown pattern", async () => {
    const res = await request(buildRunbookApp()).get(
      "/runbooks/" + encodeURIComponent("GET /nope")
    );
    expect(res.status).toBe(404);
  });

  it("returns the runbook entry", async () => {
    setRunbook("POST /orders", "https://wiki.example.com/orders", { summary: "Order flow" });
    const res = await request(buildRunbookApp()).get(
      "/runbooks/" + encodeURIComponent("POST /orders")
    );
    expect(res.status).toBe(200);
    expect(res.body.url).toBe("https://wiki.example.com/orders");
    expect(res.body.summary).toBe("Order flow");
  });
});

describe("PUT /runbooks/:pattern", () => {
  it("returns 400 when url is missing", async () => {
    const res = await request(buildRunbookApp())
      .put("/runbooks/" + encodeURIComponent("GET /test"))
      .send({});
    expect(res.status).toBe(400);
  });

  it("creates a new runbook entry", async () => {
    const res = await request(buildRunbookApp())
      .put("/runbooks/" + encodeURIComponent("GET /health"))
      .send({ url: "https://wiki.example.com/health", updatedBy: "bob" });
    expect(res.status).toBe(200);
    expect(res.body.url).toBe("https://wiki.example.com/health");
    expect(res.body.updatedBy).toBe("bob");
  });
});

describe("DELETE /runbooks/:pattern", () => {
  it("returns 404 when runbook does not exist", async () => {
    const res = await request(buildRunbookApp()).delete(
      "/runbooks/" + encodeURIComponent("GET /missing")
    );
    expect(res.status).toBe(404);
  });

  it("removes an existing runbook", async () => {
    setRunbook("DELETE /items", "https://wiki.example.com/items");
    const res = await request(buildRunbookApp()).delete(
      "/runbooks/" + encodeURIComponent("DELETE /items")
    );
    expect(res.status).toBe(204);
  });
});
