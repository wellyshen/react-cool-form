import set from "../set";

describe("set", () => {
  const obj = { baz: "🍋" };

  it("should throw error when input is invalid", () => {
    expect(() => set(null, "foo", "🍎")).toThrow(TypeError);
    expect(() => set(undefined, "foo", "🍎")).toThrow(TypeError);
    expect(() => set(true, "foo", "🍎")).toThrow(TypeError);
    expect(() => set("", "foo", "🍎")).toThrow(TypeError);
    expect(() => set(1, "foo", "🍎")).toThrow(TypeError);
    expect(() => set([], "foo", "🍎")).toThrow(TypeError);
    expect(() => set(() => null, "foo", "🍎")).toThrow(TypeError);
  });

  it("should set value by keys", () => {
    expect(set({ ...obj }, "foo", "🍎")).toEqual({ foo: "🍎", ...obj });
    expect(set({ foo: "", ...obj }, "foo", "🍎")).toEqual({
      foo: "🍎",
      ...obj,
    });
    expect(set({ foo: {}, ...obj }, "foo", "🍎")).toEqual({
      foo: "🍎",
      ...obj,
    });
    expect(set({ foo: [], ...obj }, "foo", "🍎")).toEqual({
      foo: "🍎",
      ...obj,
    });
    expect(set({ foo: { a: "" }, ...obj }, "foo.a", "🍎")).toEqual({
      foo: { a: "🍎" },
      ...obj,
    });
    expect(set({ foo: { a: [] }, ...obj }, "foo.a.b", "🍎")).toEqual({
      foo: { a: { b: "🍎" } },
      ...obj,
    });
    expect(set({ foo: { a: { b: "" }, ...obj } }, "foo.a.b", "🍎")).toEqual({
      foo: { a: { b: "🍎" }, ...obj },
    });
  });

  it("should set value by indexes", () => {
    expect(set({ ...obj }, "foo.0", "🍎")).toEqual({ foo: ["🍎"], ...obj });
    expect(set({ ...obj }, "foo.1", "🍎")).toEqual({ foo: [, "🍎"], ...obj });
    expect(set({ foo: [], ...obj }, "foo.0", "🍎")).toEqual({
      foo: ["🍎"],
      ...obj,
    });
    expect(set({ foo: {}, ...obj }, "foo.1", "🍎")).toEqual({
      foo: [, "🍎"],
      ...obj,
    });
    expect(set({ foo: {}, ...obj }, "foo.0.1", "🍎")).toEqual({
      foo: [[, "🍎"]],
      ...obj,
    });
    expect(set({ foo: {}, ...obj }, "foo.1.1", "🍎")).toEqual({
      foo: [, [, "🍎"]],
      ...obj,
    });

    expect(set({ ...obj }, "foo[0]", "🍎")).toEqual({ foo: ["🍎"], ...obj });
    expect(set({ ...obj }, "foo[1]", "🍎")).toEqual({ foo: [, "🍎"], ...obj });
    expect(set({ foo: [], ...obj }, "foo[0]", "🍎")).toEqual({
      foo: ["🍎"],
      ...obj,
    });
    expect(set({ foo: {}, ...obj }, "foo[1]", "🍎")).toEqual({
      foo: [, "🍎"],
      ...obj,
    });
    expect(set({ foo: {}, ...obj }, "foo[0][1]", "🍎")).toEqual({
      foo: [[, "🍎"]],
      ...obj,
    });
    expect(set({ foo: {}, ...obj }, "foo[1][1]", "🍎")).toEqual({
      foo: [, [, "🍎"]],
      ...obj,
    });
  });

  it("should get value by mixed", () => {
    expect(
      set({ foo: { a: [{ b: "" }] }, ...obj }, "foo.a[0].1", "🍎")
    ).toEqual({
      foo: { a: [[, "🍎"]] },
      ...obj,
    });
    expect(
      set({ foo: { a: [{ b: {} }] }, ...obj }, "foo.0.a[1]", "🍎")
    ).toEqual({
      foo: [{ a: [, "🍎"] }],
      ...obj,
    });
    expect(
      set({ foo: { a: [{ b: [], ...obj }] } }, "foo[0].a.b", "🍎")
    ).toEqual({
      foo: [{ a: { b: "🍎" } }],
    });
    expect(
      set({ foo: { a: [, { b: "" }], ...obj } }, "foo.a[1].b.0[1]", "🍎")
    ).toEqual({
      foo: { a: [, { b: [[, "🍎"]] }], ...obj },
    });
  });

  it("should set value with mutable way", () => {
    const obj = { foo: "🍋" };
    set(obj, "foo", "🍎");
    expect(obj).toEqual({ foo: "🍎" });
  });

  it("should set value with immutable way", () => {
    const obj = { foo: "🍋" };
    set(obj, "foo", "🍎", true);
    expect(obj).toEqual(obj);
  });
});
