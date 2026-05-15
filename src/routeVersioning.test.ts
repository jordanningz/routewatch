import {
  setRouteVersion,
  getRouteVersion,
  removeRouteVersion,
  getAllVersions,
  getRoutesByVersion,
  getSunsetRoutes,
  resetVersions,
} from "./routeVersioning";

beforeEach(() => {
  resetVersions();
});

describe("setRouteVersion / getRouteVersion", () => {
  it("stores and retrieves version info", () => {
    setRouteVersion("/api/users", { version: "v1", notes: "initial" });
    expect(getRouteVersion("/api/users")).toEqual({
      version: "v1",
      notes: "initial",
    });
  });

  it("throws when pattern is missing", () => {
    expect(() => setRouteVersion("", { version: "v1" })).toThrow();
  });

  it("throws when version is missing", () => {
    expect(() => setRouteVersion("/api/users", { version: "" })).toThrow();
  });

  it("returns undefined for unknown pattern", () => {
    expect(getRouteVersion("/unknown")).toBeUndefined();
  });
});

describe("removeRouteVersion", () => {
  it("removes a registered version", () => {
    setRouteVersion("/api/orders", { version: "v2" });
    expect(removeRouteVersion("/api/orders")).toBe(true);
    expect(getRouteVersion("/api/orders")).toBeUndefined();
  });

  it("returns false when pattern not found", () => {
    expect(removeRouteVersion("/nonexistent")).toBe(false);
  });
});

describe("getAllVersions", () => {
  it("returns all registered versions", () => {
    setRouteVersion("/api/a", { version: "v1" });
    setRouteVersion("/api/b", { version: "v2" });
    const all = getAllVersions();
    expect(Object.keys(all)).toHaveLength(2);
    expect(all["/api/a"].version).toBe("v1");
  });
});

describe("getRoutesByVersion", () => {
  it("returns routes matching a version", () => {
    setRouteVersion("/api/a", { version: "v1" });
    setRouteVersion("/api/b", { version: "v1" });
    setRouteVersion("/api/c", { version: "v2" });
    expect(getRoutesByVersion("v1")).toEqual(
      expect.arrayContaining(["/api/a", "/api/b"])
    );
    expect(getRoutesByVersion("v2")).toEqual(["/api/c"]);
  });
});

describe("getSunsetRoutes", () => {
  it("returns routes whose sunset date has passed", () => {
    setRouteVersion("/api/old", { version: "v1", sunsetAt: "2020-01-01" });
    setRouteVersion("/api/new", { version: "v2", sunsetAt: "2099-01-01" });
    const sunset = getSunsetRoutes("2024-01-01");
    expect(sunset).toContain("/api/old");
    expect(sunset).not.toContain("/api/new");
  });
});
