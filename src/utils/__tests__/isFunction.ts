import isFunction from "../isFunction";

describe("isFunction", () => {
  it("should work correctly", () => {
    expect(isFunction(undefined)).toBeFalsy();
    expect(isFunction(null)).toBeFalsy();
    expect(isFunction(true)).toBeFalsy();
    expect(isFunction(1)).toBeFalsy();
    expect(isFunction("")).toBeFalsy();
    expect(isFunction([])).toBeFalsy();
    expect(isFunction({})).toBeFalsy();
    expect(isFunction(new Date())).toBeFalsy();
    expect(isFunction(() => null)).toBeTruthy();
  });
});
