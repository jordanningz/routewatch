import {
  blacklistRoute,
  removeFromBlacklist,
  isBlacklisted,
  getBlacklist,
  resetBlacklist,
} from "./routeBlacklist";

beforeEach(() => {
  resetBlacklist();
});

describe("blacklistRoute + isBlacklisted", () => {
  it("should blacklist an exact route string", () => {
    blacklistRoute("/health");
    expect(isBlacklisted("/health")).toBe(true);
  });

  it("should not flag a route that is not blacklisted", () => {
    blacklistRoute("/health");
    expect(isBlacklisted("/api/users")).toBe(false);
  });

  it("should blacklist routes matching a regex pattern", () => {
    blacklistRoute(/^\/internal/);
    expect(isBlacklisted("/internal/metrics")).toBe(true);
    expect(isBlacklisted("/internal/status")).toBe(true);
    expect(isBlacklisted("/api/data")).toBe(false);
  });

  it("should support multiple patterns and exact routes", () => {
    blacklistRoute("/ping");
    blacklistRoute(/^\/admin/);
    expect(isBlacklisted("/ping")).toBe(true);
    expect(isBlacklisted("/admin/dashboard")).toBe(true);
    expect(isBlacklisted("/users")).toBe(false);
  });
});

describe("removeFromBlacklist", () => {
  it("should remove an exact route from the blacklist", () => {
    blacklistRoute("/health");
    removeFromBlacklist("/health");
    expect(isBlacklisted("/health")).toBe(false);
  });

  it("should remove a regex pattern from the blacklist", () => {
    const pattern = /^\/internal/;
    blacklistRoute(pattern);
    removeFromBlacklist(pattern);
    expect(isBlacklisted("/internal/metrics")).toBe(false);
  });
});

describe("getBlacklist", () => {
  it("should return current exact routes and patterns", () => {
    blacklistRoute("/health");
    blacklistRoute(/^\/admin/);
    const list = getBlacklist();
    expect(list.exact).toContain("/health");
    expect(list.patterns.length).toBe(1);
    expect(list.patterns[0].source).toBe("^\\/admin");
  });

  it("should return empty lists after reset", () => {
    blacklistRoute("/health");
    resetBlacklist();
    const list = getBlacklist();
    expect(list.exact).toHaveLength(0);
    expect(list.patterns).toHaveLength(0);
  });
});
