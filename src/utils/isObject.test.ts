import isObject from "./isObject";

describe("isObject", () => {
  it("should work correctly", () => {
    expect(isObject(undefined)).toBeFalsy();
    expect(isObject(null)).toBeFalsy();
    expect(isObject(true)).toBeFalsy();
    expect(isObject(1)).toBeFalsy();
    expect(isObject("")).toBeFalsy();
    expect(isObject(() => null)).toBeFalsy();
    expect(isObject(new Date())).toBeTruthy();
    expect(isObject([])).toBeTruthy();
    expect(isObject({})).toBeTruthy();
  });
});
