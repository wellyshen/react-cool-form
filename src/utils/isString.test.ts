import isString from "./isString";

describe("isString", () => {
  it("should work correctly", () => {
    expect(isString(undefined)).toBeFalsy();
    expect(isString(null)).toBeFalsy();
    expect(isString(NaN)).toBeFalsy();
    expect(isString(true)).toBeFalsy();
    expect(isString(1)).toBeFalsy();
    expect(isString(() => null)).toBeFalsy();
    expect(isString(new Date())).toBeFalsy();
    expect(isString([])).toBeFalsy();
    expect(isString({})).toBeFalsy();
    expect(isString("")).toBeTruthy();
  });
});
