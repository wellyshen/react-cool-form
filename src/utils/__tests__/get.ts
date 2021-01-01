import get from "../get";

describe("get", () => {
  it('should return "undefined" when input isn\'t an object', () => {
    expect(get(null, "foo")).toBeUndefined();
    expect(get(undefined, "foo")).toBeUndefined();
    expect(get(true, "foo")).toBeUndefined();
    expect(get("", "foo")).toBeUndefined();
    expect(get(1, "foo")).toBeUndefined();
    expect(get([], "foo")).toBeUndefined();
    expect(get(() => null, "foo")).toBeUndefined();
  });

  it('should return "undefined" when path is invalid', () => {
    // @ts-ignore
    expect(get({}, null)).toBeUndefined();
    // @ts-ignore
    expect(get({}, undefined)).toBeUndefined();
    expect(get({}, "")).toBeUndefined();
  });

  it("should return default value if property not found", () => {
    expect(get({}, "foo", "🍎")).toBe("🍎");
    expect(get({ foo: [] }, "foo.0", "🍎")).toBe("🍎");
    expect(get({ foo: [] }, "foo[0]", "🍎")).toBe("🍎");
    expect(get({ foo: [] }, "foo.bar", "🍎")).toBe("🍎");
    expect(get({ foo: [{}] }, "foo.0.bar", "🍎")).toBe("🍎");
    expect(get({ foo: [{}] }, "foo[0].bar", "🍎")).toBe("🍎");
  });

  it("should get value by keys", () => {
    expect(get({ foo: "🍎" }, "foo")).toBe("🍎");
    expect(get({ foo: { bar: "🍎" } }, "foo.bar")).toBe("🍎");
    expect(get({ foo: { bar: { baz: "🍎" } } }, "foo.bar.baz")).toBe("🍎");
  });

  it("should get value by indexes", () => {
    expect(get({ foo: ["🍎"] }, "foo.0")).toBe("🍎");
    expect(get({ foo: ["🍋", "🍎"] }, "foo.1")).toBe("🍎");
    expect(get({ foo: [["🍎"]] }, "foo.0.0")).toBe("🍎");
    expect(get({ foo: [["🍋", "🍎"]] }, "foo.0.1")).toBe("🍎");

    expect(get({ foo: ["🍎"] }, "foo[0]")).toBe("🍎");
    expect(get({ foo: ["🍋", "🍎"] }, "foo[1]")).toBe("🍎");
    expect(get({ foo: [["🍎"]] }, "foo[0][0]")).toBe("🍎");
    expect(get({ foo: [["🍋", "🍎"]] }, "foo[0][1]")).toBe("🍎");
  });

  it("should get value by mixed", () => {
    expect(get({ foo: { bar: [["🍋", "🍎"]] } }, "foo.bar[0].1")).toBe("🍎");
    expect(get({ foo: [{ bar: ["🍋", "🍎"] }] }, "foo.0.bar[1]")).toBe("🍎");
    expect(get({ foo: [["🍋", { bar: "🍎" }]] }, "foo[0].1.bar")).toBe("🍎");
  });
});
