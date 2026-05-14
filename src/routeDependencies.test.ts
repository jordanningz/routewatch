import {
  addDependency,
  removeDependency,
  getDependencies,
  getAllDependencies,
  getTransitiveUpstream,
  clearDependenciesForRoute,
  resetDependencies,
} from "./routeDependencies";

beforeEach(() => {
  resetDependencies();
});

describe("addDependency", () => {
  it("records upstream and downstream links", () => {
    addDependency("/orders", "/users");
    expect(getDependencies("/orders").upstream).toContain("/users");
    expect(getDependencies("/users").downstream).toContain("/orders");
  });

  it("does not duplicate entries", () => {
    addDependency("/orders", "/users");
    addDependency("/orders", "/users");
    expect(getDependencies("/orders").upstream).toHaveLength(1);
  });
});

describe("removeDependency", () => {
  it("removes the upstream link and its inverse", () => {
    addDependency("/orders", "/users");
    removeDependency("/orders", "/users");
    expect(getDependencies("/orders").upstream).toHaveLength(0);
    expect(getDependencies("/users").downstream).toHaveLength(0);
  });
});

describe("getDependencies", () => {
  it("returns empty arrays for unknown route", () => {
    const dep = getDependencies("/unknown");
    expect(dep.upstream).toEqual([]);
    expect(dep.downstream).toEqual([]);
  });
});

describe("getAllDependencies", () => {
  it("returns all tracked routes", () => {
    addDependency("/a", "/b");
    addDependency("/c", "/a");
    const all = getAllDependencies();
    expect(Object.keys(all)).toContain("/a");
    expect(Object.keys(all)).toContain("/b");
  });
});

describe("getTransitiveUpstream", () => {
  it("returns all transitive dependencies", () => {
    addDependency("/c", "/b");
    addDependency("/b", "/a");
    const result = getTransitiveUpstream("/c");
    expect(result).toContain("/b");
    expect(result).toContain("/a");
  });

  it("handles circular dependencies gracefully", () => {
    addDependency("/a", "/b");
    addDependency("/b", "/a");
    expect(() => getTransitiveUpstream("/a")).not.toThrow();
  });
});

describe("clearDependenciesForRoute", () => {
  it("removes the route and cleans up references", () => {
    addDependency("/orders", "/users");
    clearDependenciesForRoute("/orders");
    expect(getDependencies("/orders").upstream).toHaveLength(0);
    expect(getDependencies("/users").downstream).toHaveLength(0);
  });
});
