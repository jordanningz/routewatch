import {
  configureRouteUptime,
  getRouteUptimeConfig,
  resetRouteUptime,
  recordRequest,
  getUptimeRecord,
  getAllUptimeRecords,
  getUptimePercentage,
} from "./routeUptime";

beforeEach(() => {
  resetRouteUptime();
});

describe("configureRouteUptime", () => {
  it("applies partial config overrides", () => {
    configureRouteUptime({ errorRateThreshold: 0.3 });
    expect(getRouteUptimeConfig().errorRateThreshold).toBe(0.3);
    expect(getRouteUptimeConfig().windowSize).toBe(20);
  });

  it("resets to defaults after resetRouteUptime", () => {
    configureRouteUptime({ windowSize: 5 });
    resetRouteUptime();
    expect(getRouteUptimeConfig().windowSize).toBe(20);
  });
});

describe("recordRequest + getUptimeRecord", () => {
  it("creates a record on first request", () => {
    recordRequest("/api/health", true);
    const rec = getUptimeRecord("/api/health");
    expect(rec).toBeDefined();
    expect(rec!.isUp).toBe(true);
    expect(rec!.route).toBe("/api/health");
  });

  it("marks route as down when error rate exceeds threshold", () => {
    configureRouteUptime({ errorRateThreshold: 0.5, windowSize: 4 });
    recordRequest("/api/users", false);
    recordRequest("/api/users", false);
    recordRequest("/api/users", false);
    recordRequest("/api/users", false);
    const rec = getUptimeRecord("/api/users");
    expect(rec!.isUp).toBe(false);
  });

  it("marks route as up when errors are below threshold", () => {
    configureRouteUptime({ errorRateThreshold: 0.5, windowSize: 4 });
    recordRequest("/api/items", true);
    recordRequest("/api/items", true);
    recordRequest("/api/items", false);
    recordRequest("/api/items", true);
    const rec = getUptimeRecord("/api/items");
    expect(rec!.isUp).toBe(true);
  });

  it("respects the sliding window size", () => {
    configureRouteUptime({ errorRateThreshold: 0.5, windowSize: 2 });
    // fill with failures then recover
    recordRequest("/api/ping", false);
    recordRequest("/api/ping", false);
    recordRequest("/api/ping", true);
    recordRequest("/api/ping", true);
    const rec = getUptimeRecord("/api/ping");
    expect(rec!.isUp).toBe(true);
  });
});

describe("getAllUptimeRecords", () => {
  it("returns records for all tracked routes", () => {
    recordRequest("/a", true);
    recordRequest("/b", false);
    const all = getAllUptimeRecords();
    expect(all.map(r => r.route).sort()).toEqual(["/a", "/b"]);
  });
});

describe("getUptimePercentage", () => {
  it("returns null for unknown route", () => {
    expect(getUptimePercentage("/unknown")).toBeNull();
  });

  it("returns 100 for a route with no elapsed time but currently up", () => {
    recordRequest("/api/x", true);
    expect(getUptimePercentage("/api/x")).toBe(100);
  });

  it("returns 0 for a route with no elapsed time but currently down", () => {
    configureRouteUptime({ errorRateThreshold: 0.5, windowSize: 1 });
    recordRequest("/api/y", false);
    expect(getUptimePercentage("/api/y")).toBe(0);
  });
});
