import get from "../get";

describe("get", () => {
  it("should work correctly", () => {
    const obj = {
      foo: "🍎",
      bar: ["🍎", "🍎"],
      baz: { nested: "🍎" },
      qux: [{ nested: "🍎" }, { nested: "🍎" }],
    };
    expect(get(obj, "foo")).toBe(obj.foo);
    expect(get(obj, "bar[0]")).toBe(obj.bar[0]);
    expect(get(obj, "bar[1]")).toBe(obj.bar[1]);
    expect(get(obj, "bar.0")).toBe(obj.bar[0]);
    expect(get(obj, "bar.1")).toBe(obj.bar[1]);
    expect(get(obj, "baz.nested")).toBe(obj.baz.nested);
    expect(get(obj, "qux[0].nested")).toBe(obj.qux[0].nested);
    expect(get(obj, "qux[1].nested")).toBe(obj.qux[1].nested);
    expect(get(obj, "qux.0.nested")).toBe(obj.qux[0].nested);
    expect(get(obj, "qux.1.nested")).toBe(obj.qux[1].nested);
    expect(get(obj, "quux")).toBeUndefined();
    expect(get(obj, "quux", "🍎")).toBe("🍎");
    expect(get("", "foo")).toBeUndefined();
    expect(get(0, "foo")).toBeUndefined();
    expect(get(null, "foo")).toBeUndefined();
    expect(get(true, "foo")).toBeUndefined();
  });
});
