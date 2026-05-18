import {
  setTimeout,
  getTimeout,
  removeTimeout,
  getAllTimeouts,
  hasTimeout,
  resetTimeouts,
  isTimedOut,
} from "./routeTimeout";

beforeEach(() => {
  resetTimeouts();
});

describe("setTimeout / getTimeout", () => {
  it("stores and retrieves a timeout config", () => {
    const entry = setTimeout("/api/slow", { limitMs: 3000, action: "alert" });
    expect(entry.route).toBe("/api/slow");
    expect(entry.limitMs).toBe(3000);
    expect(entry.action).toBe("alert");
    expect(entry.createdAt).toBeDefined();
  });

  it("defaults action to 'log' when not provided", () => {
    const entry = setTimeout("/api/default", { limitMs: 1000 });
    expect(entry.action).toBe("log");
  });

  it("returns undefined for unknown route", () => {
    expect(getTimeout("/unknown")).toBeUndefined();
  });

  it("overwrites an existing timeout", () => {
    setTimeout("/api/x", { limitMs: 500 });
    setTimeout("/api/x", { limitMs: 1500, action: "abort" });
    const entry = getTimeout("/api/x");
    expect(entry?.limitMs).toBe(1500);
    expect(entry?.action).toBe("abort");
  });
});

describe("removeTimeout", () => {
  it("removes an existing timeout and returns true", () => {
    setTimeout("/api/remove", { limitMs: 200 });
    expect(removeTimeout("/api/remove")).toBe(true);
    expect(getTimeout("/api/remove")).toBeUndefined();
  });

  it("returns false when route not found", () => {
    expect(removeTimeout("/api/ghost")).toBe(false);
  });
});

describe("getAllTimeouts", () => {
  it("returns all configured timeouts", () => {
    setTimeout("/a", { limitMs: 100 });
    setTimeout("/b", { limitMs: 200 });
    const all = getAllTimeouts();
    expect(all).toHaveLength(2);
    expect(all.map((e) => e.route)).toEqual(expect.arrayContaining(["/a", "/b"]));
  });

  it("returns empty array when no timeouts set", () => {
    expect(getAllTimeouts()).toEqual([]);
  });
});

describe("hasTimeout", () => {
  it("returns true when timeout exists", () => {
    setTimeout("/api/check", { limitMs: 500 });
    expect(hasTimeout("/api/check")).toBe(true);
  });

  it("returns false when timeout does not exist", () => {
    expect(hasTimeout("/api/missing")).toBe(false);
  });
});

describe("isTimedOut", () => {
  it("returns true when duration exceeds limit", () => {
    setTimeout("/api/slow", { limitMs: 1000 });
    expect(isTimedOut("/api/slow", 1500)).toBe(true);
  });

  it("returns false when duration is within limit", () => {
    setTimeout("/api/fast", { limitMs: 1000 });
    expect(isTimedOut("/api/fast", 800)).toBe(false);
  });

  it("returns false when no timeout configured for route", () => {
    expect(isTimedOut("/api/unconfigured", 9999)).toBe(false);
  });
});
