import filterErrors from "./filterErrors";

describe("filterErrors", () => {
  it("should work correctly", () => {
    expect(filterErrors({ foo: "🍎" }, { foo: true })).toEqual({ foo: "🍎" });
    expect(filterErrors({ foo: "🍎" }, {})).toEqual({});
    const foo = new Date();
    expect(filterErrors({ foo }, { foo: true })).toEqual({ foo });
  });
});
