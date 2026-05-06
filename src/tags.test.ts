import {
  tagRoute,
  getTagsForRoute,
  getRoutesByTag,
  clearTagsForRoute,
  resetTags,
  getAllTags,
} from "./tags";

beforeEach(() => {
  resetTags();
});

describe("tagRoute / getTagsForRoute", () => {
  it("returns empty array for untagged route", () => {
    expect(getTagsForRoute("/api/users")).toEqual([]);
  });

  it("stores tags for a route", () => {
    tagRoute("/api/users", ["critical", "auth"]);
    expect(getTagsForRoute("/api/users")).toEqual(["critical", "auth"]);
  });

  it("merges tags on repeated calls without duplicates", () => {
    tagRoute("/api/orders", ["billing"]);
    tagRoute("/api/orders", ["billing", "critical"]);
    expect(getTagsForRoute("/api/orders")).toEqual(["billing", "critical"]);
  });
});

describe("getRoutesByTag", () => {
  it("returns empty array when no routes have the tag", () => {
    expect(getRoutesByTag("critical")).toEqual([]);
  });

  it("returns all routes with a given tag", () => {
    tagRoute("/api/users", ["critical"]);
    tagRoute("/api/orders", ["critical", "billing"]);
    tagRoute("/api/health", ["internal"]);
    const routes = getRoutesByTag("critical");
    expect(routes).toContain("/api/users");
    expect(routes).toContain("/api/orders");
    expect(routes).not.toContain("/api/health");
  });
});

describe("clearTagsForRoute", () => {
  it("removes all tags for a specific route", () => {
    tagRoute("/api/users", ["critical"]);
    clearTagsForRoute("/api/users");
    expect(getTagsForRoute("/api/users")).toEqual([]);
  });

  it("does not affect other routes", () => {
    tagRoute("/api/users", ["critical"]);
    tagRoute("/api/orders", ["billing"]);
    clearTagsForRoute("/api/users");
    expect(getTagsForRoute("/api/orders")).toEqual(["billing"]);
  });
});

describe("getAllTags", () => {
  it("returns empty object when no tags registered", () => {
    expect(getAllTags()).toEqual({});
  });

  it("returns snapshot of all registered tags", () => {
    tagRoute("/api/users", ["critical"]);
    tagRoute("/api/orders", ["billing"]);
    expect(getAllTags()).toEqual({
      "/api/users": ["critical"],
      "/api/orders": ["billing"],
    });
  });

  it("returns copies so mutations do not affect internal state", () => {
    tagRoute("/api/users", ["critical"]);
    const snapshot = getAllTags();
    snapshot["/api/users"].push("mutated");
    expect(getTagsForRoute("/api/users")).toEqual(["critical"]);
  });
});
