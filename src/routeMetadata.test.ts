import {
  setMetadata,
  getMetadata,
  removeMetadataKey,
  clearMetadata,
  getAllMetadata,
  getRoutesByMetadataKey,
  resetMetadata,
} from "./routeMetadata";

beforeEach(() => {
  resetMetadata();
});

describe("setMetadata / getMetadata", () => {
  it("stores metadata for a route", () => {
    setMetadata("/api/users", { version: 2, internal: true });
    expect(getMetadata("/api/users")).toEqual({ version: 2, internal: true });
  });

  it("merges new keys into existing metadata", () => {
    setMetadata("/api/users", { version: 2 });
    setMetadata("/api/users", { owner: "platform" });
    expect(getMetadata("/api/users")).toEqual({ version: 2, owner: "platform" });
  });

  it("later value wins on key collision", () => {
    setMetadata("/api/users", { version: 1 });
    setMetadata("/api/users", { version: 3 });
    expect(getMetadata("/api/users")?.version).toBe(3);
  });

  it("returns undefined for unknown route", () => {
    expect(getMetadata("/unknown")).toBeUndefined();
  });
});

describe("removeMetadataKey", () => {
  it("removes a single key from the entry", () => {
    setMetadata("/api/orders", { version: 1, internal: false });
    removeMetadataKey("/api/orders", "internal");
    expect(getMetadata("/api/orders")).toEqual({ version: 1 });
  });

  it("removes the route entirely when last key is deleted", () => {
    setMetadata("/api/orders", { version: 1 });
    removeMetadataKey("/api/orders", "version");
    expect(getMetadata("/api/orders")).toBeUndefined();
  });

  it("is a no-op for unknown route", () => {
    expect(() => removeMetadataKey("/ghost", "key")).not.toThrow();
  });
});

describe("clearMetadata", () => {
  it("removes all metadata for a route", () => {
    setMetadata("/api/items", { a: 1, b: 2 });
    clearMetadata("/api/items");
    expect(getMetadata("/api/items")).toBeUndefined();
  });
});

describe("getAllMetadata", () => {
  it("returns all stored metadata", () => {
    setMetadata("/a", { x: 1 });
    setMetadata("/b", { y: 2 });
    const all = getAllMetadata();
    expect(Object.keys(all)).toHaveLength(2);
    expect(all["/a"]).toEqual({ x: 1 });
    expect(all["/b"]).toEqual({ y: 2 });
  });

  it("returns empty object when store is empty", () => {
    expect(getAllMetadata()).toEqual({});
  });
});

describe("getRoutesByMetadataKey", () => {
  it("returns routes that contain the given key", () => {
    setMetadata("/api/a", { internal: true });
    setMetadata("/api/b", { version: 1 });
    setMetadata("/api/c", { internal: false });
    const routes = getRoutesByMetadataKey("internal");
    expect(routes).toContain("/api/a");
    expect(routes).toContain("/api/c");
    expect(routes).not.toContain("/api/b");
  });

  it("returns empty array when no routes match", () => {
    setMetadata("/api/x", { foo: 1 });
    expect(getRoutesByMetadataKey("bar")).toEqual([]);
  });
});
