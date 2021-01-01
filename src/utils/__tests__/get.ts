import get from "../get";

describe("get", () => {
  it("should return default value when target isn't an object", () => {
    expect(get(null, "foo")).toBeUndefined();
    expect(get(undefined, "foo")).toBeUndefined();
    expect(get(true, "foo")).toBeUndefined();
    expect(get("", "foo")).toBeUndefined();
    expect(get(1, "foo")).toBeUndefined();
    expect(get([], "foo")).toBeUndefined();
    expect(get(() => null, "foo")).toBeUndefined();
  });

  it("should return default value when path is invalid", () => {
    // @ts-ignore
    expect(get({}, null)).toBeUndefined();
    // @ts-ignore
    expect(get({}, undefined)).toBeUndefined();
    expect(get({}, "")).toBeUndefined();
  });

  it("should get value by keys", () => {
    expect(get({ foo: "🍎" }, "foo")).toBe("🍎");
    expect(get({ foo: ["🍎"] }, "foo")).toEqual(["🍎"]);
    expect(get({ foo: null }, "foo")).toBeNull();
    expect(get({ foo: undefined }, "foo")).toBeUndefined();
    expect(get({ foo: true }, "foo")).toBe(true);
    expect(get({ foo: 1 }, "foo")).toBe(1);
  });
});
