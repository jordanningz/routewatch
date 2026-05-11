import {
  logChange,
  getChangelog,
  getLatestChange,
  getChangelogByAuthor,
  getAllChangelogs,
  clearChangelog,
  resetChangelogs,
} from "./routeChangelog";

beforeEach(() => {
  resetChangelogs();
});

describe("logChange", () => {
  it("records a changelog entry for a route", () => {
    const entry = logChange("/api/users", "alice", "Added rate limiting");
    expect(entry.author).toBe("alice");
    expect(entry.description).toBe("Added rate limiting");
    expect(typeof entry.timestamp).toBe("number");
  });

  it("stores optional metadata", () => {
    const entry = logChange("/api/items", "bob", "Updated timeout", {
      oldTimeout: 3000,
      newTimeout: 5000,
    });
    expect(entry.metadata).toEqual({ oldTimeout: 3000, newTimeout: 5000 });
  });

  it("accumulates multiple entries for the same route", () => {
    logChange("/api/users", "alice", "First change");
    logChange("/api/users", "bob", "Second change");
    expect(getChangelog("/api/users")).toHaveLength(2);
  });
});

describe("getChangelog", () => {
  it("returns empty array for unknown route", () => {
    expect(getChangelog("/api/unknown")).toEqual([]);
  });

  it("returns all entries for a route", () => {
    logChange("/api/orders", "alice", "Init");
    logChange("/api/orders", "alice", "Update");
    expect(getChangelog("/api/orders")).toHaveLength(2);
  });
});

describe("getLatestChange", () => {
  it("returns undefined for unknown route", () => {
    expect(getLatestChange("/nope")).toBeUndefined();
  });

  it("returns the most recent entry", () => {
    logChange("/api/users", "alice", "First");
    logChange("/api/users", "bob", "Second");
    const latest = getLatestChange("/api/users");
    expect(latest?.description).toBe("Second");
  });
});

describe("getChangelogByAuthor", () => {
  it("returns only entries by the given author", () => {
    logChange("/api/users", "alice", "Alice change");
    logChange("/api/users", "bob", "Bob change");
    logChange("/api/orders", "alice", "Another Alice change");
    const result = getChangelogByAuthor("alice");
    expect(result["/api/users"]).toHaveLength(1);
    expect(result["/api/orders"]).toHaveLength(1);
    expect(result["/api/users"][0].author).toBe("alice");
  });

  it("returns empty object when author has no entries", () => {
    expect(getChangelogByAuthor("ghost")).toEqual({});
  });
});

describe("getAllChangelogs", () => {
  it("returns all routes and their entries", () => {
    logChange("/a", "alice", "change a");
    logChange("/b", "bob", "change b");
    const all = getAllChangelogs();
    expect(Object.keys(all)).toHaveLength(2);
  });
});

describe("clearChangelog", () => {
  it("removes entries for a specific route", () => {
    logChange("/api/users", "alice", "change");
    clearChangelog("/api/users");
    expect(getChangelog("/api/users")).toEqual([]);
  });
});
