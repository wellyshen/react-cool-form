import set from "./set";

describe("set", () => {
  const other = { baz: "🍋" };

  it("should throw error when input is invalid", () => {
    expect(() => set(null, "foo", "🍎")).toThrow(TypeError);
    expect(() => set(undefined, "foo", "🍎")).toThrow(TypeError);
    expect(() => set(true, "foo", "🍎")).toThrow(TypeError);
    expect(() => set("", "foo", "🍎")).toThrow(TypeError);
    expect(() => set(1, "foo", "🍎")).toThrow(TypeError);
    expect(() => set([], "foo", "🍎")).toThrow(TypeError);
    expect(() => set(new Date(), "foo", "🍎")).toThrow(TypeError);
    expect(() => set(() => null, "foo", "🍎")).toThrow(TypeError);
  });

  it("should set value by keys", () => {
    expect(set({ ...other }, "foo", "🍎")).toEqual({ foo: "🍎", ...other });
    expect(set({ foo: "", ...other }, "foo", "🍎")).toEqual({
      foo: "🍎",
      ...other,
    });
    expect(set({ foo: {}, ...other }, "foo", "🍎")).toEqual({
      foo: "🍎",
      ...other,
    });
    expect(set({ foo: [], ...other }, "foo", "🍎")).toEqual({
      foo: "🍎",
      ...other,
    });
    expect(set({ foo: { a: "" }, ...other }, "foo.a", "🍎")).toEqual({
      foo: { a: "🍎" },
      ...other,
    });
    expect(set({ foo: { a: [] }, ...other }, "foo.a.b", "🍎")).toEqual({
      foo: { a: { b: "🍎" } },
      ...other,
    });
    expect(set({ foo: { a: { b: "" }, ...other } }, "foo.a.b", "🍎")).toEqual({
      foo: { a: { b: "🍎" }, ...other },
    });
  });

  it("should set value by indexes", () => {
    expect(set({ ...other }, "foo.0", "🍎")).toEqual({ foo: ["🍎"], ...other });
    expect(set({ ...other }, "foo.1", "🍎")).toEqual({
      foo: [, "🍎"],
      ...other,
    });
    expect(set({ foo: [], ...other }, "foo.0", "🍎")).toEqual({
      foo: ["🍎"],
      ...other,
    });
    expect(set({ foo: {}, ...other }, "foo.1", "🍎")).toEqual({
      foo: [, "🍎"],
      ...other,
    });
    expect(set({ foo: {}, ...other }, "foo.0.1", "🍎")).toEqual({
      foo: [[, "🍎"]],
      ...other,
    });
    expect(set({ foo: {}, ...other }, "foo.1.1", "🍎")).toEqual({
      foo: [, [, "🍎"]],
      ...other,
    });

    expect(set({ ...other }, "foo[0]", "🍎")).toEqual({
      foo: ["🍎"],
      ...other,
    });
    expect(set({ ...other }, "foo[1]", "🍎")).toEqual({
      foo: [, "🍎"],
      ...other,
    });
    expect(set({ foo: [], ...other }, "foo[0]", "🍎")).toEqual({
      foo: ["🍎"],
      ...other,
    });
    expect(set({ foo: {}, ...other }, "foo[1]", "🍎")).toEqual({
      foo: [, "🍎"],
      ...other,
    });
    expect(set({ foo: {}, ...other }, "foo[0][1]", "🍎")).toEqual({
      foo: [[, "🍎"]],
      ...other,
    });
    expect(set({ foo: {}, ...other }, "foo[1][1]", "🍎")).toEqual({
      foo: [, [, "🍎"]],
      ...other,
    });
  });

  it("should get value by mixed", () => {
    expect(
      set({ foo: { a: [{ b: "" }] }, ...other }, "foo.a[0].1", "🍎")
    ).toEqual({
      foo: { a: [[, "🍎"]] },
      ...other,
    });
    expect(
      set({ foo: { a: [{ b: {} }] }, ...other }, "foo.0.a[1]", "🍎")
    ).toEqual({
      foo: [{ a: [, "🍎"] }],
      ...other,
    });
    expect(
      set({ foo: { a: [{ b: [], ...other }] } }, "foo[0].a.b", "🍎")
    ).toEqual({
      foo: [{ a: { b: "🍎" } }],
    });
    expect(
      set({ foo: { a: [, { b: "" }], ...other } }, "foo.a[1].b.0[1]", "🍎")
    ).toEqual({
      foo: { a: [, { b: [[, "🍎"]] }], ...other },
    });
  });

  it("should set value with mutable way", () => {
    const target = { foo: { a: "🍋" } };
    set(target, "foo.a", "🍎");
    expect(target).toEqual({ foo: { a: "🍎" } });
  });

  it("should set value with immutable way", () => {
    const target = { foo: { a: "🍋" } };
    set(target, "foo.a", "🍎", true);
    expect(target).toEqual({ foo: { a: "🍋" } });
  });
});
