import filterErrors from "./filterErrors";

describe("filterErrors", () => {
  it("should work correctly", () => {
    expect(filterErrors(undefined, false)).toBeUndefined();
    expect(filterErrors(undefined, false)).toBeUndefined();
    expect(filterErrors({}, false)).toEqual({});
    expect(filterErrors("🍎", false)).toBeUndefined();
    expect(filterErrors("🍎", true)).toBe("🍎");
    expect(filterErrors({ foo: "🍎" }, { foo: true })).toEqual({ foo: "🍎" });
    expect(filterErrors({ foo: "🍎" }, {})).toEqual({});
    const foo = new Date();
    expect(filterErrors({ foo }, { foo: true })).toEqual({ foo });
  });
});
