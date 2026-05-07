import {
  assignOwner,
  removeOwner,
  getOwner,
  getRoutesByOwner,
  getRoutesByTeam,
  getAllOwnership,
  resetOwnership,
} from "./routeOwnership";

beforeEach(() => {
  resetOwnership();
});

describe("assignOwner", () => {
  it("assigns an owner to a route", () => {
    assignOwner("/api/users", "alice");
    const entry = getOwner("/api/users");
    expect(entry?.owner).toBe("alice");
    expect(entry?.team).toBeUndefined();
  });

  it("assigns an owner with a team", () => {
    assignOwner("/api/orders", "bob", "backend");
    const entry = getOwner("/api/orders");
    expect(entry?.owner).toBe("bob");
    expect(entry?.team).toBe("backend");
  });

  it("records assignedAt timestamp", () => {
    const before = Date.now();
    assignOwner("/api/products", "carol");
    const after = Date.now();
    const entry = getOwner("/api/products");
    expect(entry?.assignedAt).toBeGreaterThanOrEqual(before);
    expect(entry?.assignedAt).toBeLessThanOrEqual(after);
  });
});

describe("removeOwner", () => {
  it("removes an existing owner entry", () => {
    assignOwner("/api/users", "alice");
    expect(removeOwner("/api/users")).toBe(true);
    expect(getOwner("/api/users")).toBeUndefined();
  });

  it("returns false when pattern not found", () => {
    expect(removeOwner("/api/unknown")).toBe(false);
  });
});

describe("getRoutesByOwner", () => {
  it("returns all routes for a given owner", () => {
    assignOwner("/api/users", "alice");
    assignOwner("/api/orders", "alice");
    assignOwner("/api/products", "bob");
    const routes = getRoutesByOwner("alice");
    expect(routes).toContain("/api/users");
    expect(routes).toContain("/api/orders");
    expect(routes).not.toContain("/api/products");
  });

  it("returns empty array when owner has no routes", () => {
    expect(getRoutesByOwner("nobody")).toEqual([]);
  });
});

describe("getRoutesByTeam", () => {
  it("returns all routes for a given team", () => {
    assignOwner("/api/users", "alice", "platform");
    assignOwner("/api/orders", "bob", "backend");
    assignOwner("/api/search", "carol", "platform");
    const routes = getRoutesByTeam("platform");
    expect(routes).toContain("/api/users");
    expect(routes).toContain("/api/search");
    expect(routes).not.toContain("/api/orders");
  });
});

describe("getAllOwnership", () => {
  it("returns a snapshot of all ownership entries", () => {
    assignOwner("/api/users", "alice", "platform");
    assignOwner("/api/orders", "bob", "backend");
    const all = getAllOwnership();
    expect(Object.keys(all)).toHaveLength(2);
    expect(all["/api/users"].owner).toBe("alice");
    expect(all["/api/orders"].team).toBe("backend");
  });

  it("returns empty object after reset", () => {
    expect(getAllOwnership()).toEqual({});
  });
});
