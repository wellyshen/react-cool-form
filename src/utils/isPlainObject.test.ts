import isPlainObject from "./isPlainObject";

describe("isPlainObject", () => {
  it("should work correctly", () => {
    expect(isPlainObject(undefined)).toBeFalsy();
    expect(isPlainObject(null)).toBeFalsy();
    expect(isPlainObject(NaN)).toBeFalsy();
    expect(isPlainObject(true)).toBeFalsy();
    expect(isPlainObject(1)).toBeFalsy();
    expect(isPlainObject("")).toBeFalsy();
    expect(isPlainObject(new Date())).toBeFalsy();
    expect(isPlainObject(() => null)).toBeFalsy();
    expect(isPlainObject([])).toBeFalsy();
    expect(isPlainObject({})).toBeTruthy();
  });
});
