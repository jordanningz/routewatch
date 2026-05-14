import express, { Express } from "express";
import request from "supertest";
import { createDependencyRouter } from "./dependencyRouter";
import { resetDependencies } from "./routeDependencies";

function buildDependencyApp(): Express {
  const app = express();
  app.use(express.json());
  app.use("/dependencies", createDependencyRouter());
  return app;
}

beforeEach(() => {
  resetDependencies();
});

describe("GET /dependencies", () => {
  it("returns empty object when no dependencies set", async () => {
    const res = await request(buildDependencyApp()).get("/dependencies");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({});
  });
});

describe("POST /dependencies", () => {
  it("adds a dependency and returns updated entry", async () => {
    const res = await request(buildDependencyApp())
      .post("/dependencies")
      .send({ route: "/orders", dependsOn: "/users" });
    expect(res.status).toBe(201);
    expect(res.body.upstream).toContain("/users");
  });

  it("returns 400 when fields are missing", async () => {
    const res = await request(buildDependencyApp())
      .post("/dependencies")
      .send({ route: "/orders" });
    expect(res.status).toBe(400);
  });
});

describe("GET /dependencies/:route", () => {
  it("returns dependency info for a route", async () => {
    const app = buildDependencyApp();
    await request(app).post("/dependencies").send({ route: "/orders", dependsOn: "/users" });
    const res = await request(app).get("/dependencies/%2Forders");
    expect(res.status).toBe(200);
    expect(res.body.upstream).toContain("/users");
  });
});

describe("GET /dependencies/:route/transitive", () => {
  it("returns transitive upstream routes", async () => {
    const app = buildDependencyApp();
    await request(app).post("/dependencies").send({ route: "/c", dependsOn: "/b" });
    await request(app).post("/dependencies").send({ route: "/b", dependsOn: "/a" });
    const res = await request(app).get("/dependencies/%2Fc/transitive");
    expect(res.status).toBe(200);
    expect(res.body.transitiveUpstream).toContain("/b");
    expect(res.body.transitiveUpstream).toContain("/a");
  });
});

describe("DELETE /dependencies", () => {
  it("removes a specific dependency", async () => {
    const app = buildDependencyApp();
    await request(app).post("/dependencies").send({ route: "/orders", dependsOn: "/users" });
    const res = await request(app)
      .delete("/dependencies")
      .send({ route: "/orders", dependsOn: "/users" });
    expect(res.status).toBe(200);
    expect(res.body.upstream).toHaveLength(0);
  });
});

describe("DELETE /dependencies/:route/all", () => {
  it("clears all dependencies for a route", async () => {
    const app = buildDependencyApp();
    await request(app).post("/dependencies").send({ route: "/orders", dependsOn: "/users" });
    const res = await request(app).delete("/dependencies/%2Forders/all");
    expect(res.status).toBe(200);
    expect(res.body.cleared).toBe("/orders");
  });
});
