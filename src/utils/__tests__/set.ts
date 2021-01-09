import set from "../set";

describe("set", () => {
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
    const obj = { obj: "🍎" };
    expect(set({ ...obj }, "foo", "🍎")).toEqual({ foo: "🍎", ...obj });
    expect(set({ foo: "", ...obj }, "foo", "🍎")).toEqual({
      foo: "🍎",
      ...obj,
    });
    expect(set({ foo: { a: "" }, ...obj }, "foo.a", "🍎")).toEqual({
      foo: { a: "🍎" },
      ...obj,
    });
    expect(set({ foo: { a: { b: "" } }, ...obj }, "foo.a.b", "🍎")).toEqual({
      foo: { a: { b: "🍎" } },
      ...obj,
    });
  });
});
