import {
  addNote,
  getNotes,
  clearNotes,
  getAllNotes,
  getNotesByAuthor,
  resetRouteNotes,
} from "./routeNotes";

beforeEach(() => {
  resetRouteNotes();
});

describe("addNote", () => {
  it("adds a note to a route", () => {
    addNote("/api/users", "This route is rate limited", "alice");
    const notes = getNotes("/api/users");
    expect(notes).toHaveLength(1);
    expect(notes[0].note).toBe("This route is rate limited");
    expect(notes[0].author).toBe("alice");
    expect(notes[0].createdAt).toBeLessThanOrEqual(Date.now());
  });

  it("allows multiple notes on the same route", () => {
    addNote("/api/users", "First note");
    addNote("/api/users", "Second note", "bob");
    expect(getNotes("/api/users")).toHaveLength(2);
  });

  it("throws if routePattern is empty", () => {
    expect(() => addNote("", "some note")).toThrow();
  });

  it("throws if note is empty", () => {
    expect(() => addNote("/api/users", "")).toThrow();
  });
});

describe("getNotes", () => {
  it("returns empty array for unknown route", () => {
    expect(getNotes("/unknown")).toEqual([]);
  });
});

describe("clearNotes", () => {
  it("removes all notes for a route", () => {
    addNote("/api/orders", "Check auth");
    clearNotes("/api/orders");
    expect(getNotes("/api/orders")).toEqual([]);
  });

  it("does not affect other routes", () => {
    addNote("/api/users", "User note");
    addNote("/api/orders", "Order note");
    clearNotes("/api/orders");
    expect(getNotes("/api/users")).toHaveLength(1);
  });
});

describe("getAllNotes", () => {
  it("returns all routes with notes", () => {
    addNote("/api/users", "Note A");
    addNote("/api/products", "Note B", "carol");
    const all = getAllNotes();
    expect(Object.keys(all)).toHaveLength(2);
    expect(all["/api/users"]).toHaveLength(1);
    expect(all["/api/products"]).toHaveLength(1);
  });

  it("returns empty object when no notes exist", () => {
    expect(getAllNotes()).toEqual({});
  });
});

describe("getNotesByAuthor", () => {
  it("returns only notes from specified author", () => {
    addNote("/api/users", "Alice note", "alice");
    addNote("/api/users", "Bob note", "bob");
    addNote("/api/orders", "Alice order note", "alice");
    const aliceNotes = getNotesByAuthor("alice");
    expect(Object.keys(aliceNotes)).toHaveLength(2);
    expect(aliceNotes["/api/users"]).toHaveLength(1);
    expect(aliceNotes["/api/orders"]).toHaveLength(1);
  });

  it("returns empty object if author has no notes", () => {
    expect(getNotesByAuthor("nobody")).toEqual({});
  });
});
