import {
  setRunbook,
  getRunbook,
  removeRunbook,
  getAllRunbooks,
  hasRunbook,
  resetRunbooks,
} from "./routeRunbook";

beforeEach(() => resetRunbooks());

describe("setRunbook", () => {
  it("stores a runbook entry with url", () => {
    const entry = setRunbook("GET /users", "https://wiki.example.com/users");
    expect(entry.url).toBe("https://wiki.example.com/users");
    expect(entry.updatedAt).toBeTruthy();
  });

  it("stores optional summary and updatedBy", () => {
    const entry = setRunbook("POST /orders", "https://wiki.example.com/orders", {
      summary: "Order creation runbook",
      updatedBy: "alice",
    });
    expect(entry.summary).toBe("Order creation runbook");
    expect(entry.updatedBy).toBe("alice");
  });

  it("overwrites an existing entry", () => {
    setRunbook("GET /users", "https://old.example.com");
    const entry = setRunbook("GET /users", "https://new.example.com");
    expect(entry.url).toBe("https://new.example.com");
  });
});

describe("getRunbook", () => {
  it("returns undefined for unknown pattern", () => {
    expect(getRunbook("DELETE /unknown")).toBeUndefined();
  });

  it("returns the stored entry", () => {
    setRunbook("GET /health", "https://wiki.example.com/health");
    expect(getRunbook("GET /health")?.url).toBe("https://wiki.example.com/health");
  });
});

describe("removeRunbook", () => {
  it("removes an existing entry and returns true", () => {
    setRunbook("GET /ping", "https://wiki.example.com/ping");
    expect(removeRunbook("GET /ping")).toBe(true);
    expect(getRunbook("GET /ping")).toBeUndefined();
  });

  it("returns false for a non-existent entry", () => {
    expect(removeRunbook("GET /missing")).toBe(false);
  });
});

describe("hasRunbook", () => {
  it("returns true when runbook exists", () => {
    setRunbook("GET /status", "https://wiki.example.com/status");
    expect(hasRunbook("GET /status")).toBe(true);
  });

  it("returns false when runbook does not exist", () => {
    expect(hasRunbook("GET /nope")).toBe(false);
  });
});

describe("getAllRunbooks", () => {
  it("returns all stored runbooks", () => {
    setRunbook("GET /a", "https://a.example.com");
    setRunbook("POST /b", "https://b.example.com");
    const all = getAllRunbooks();
    expect(Object.keys(all)).toHaveLength(2);
    expect(all["GET /a"].url).toBe("https://a.example.com");
  });

  it("returns empty object when no runbooks", () => {
    expect(getAllRunbooks()).toEqual({});
  });
});
