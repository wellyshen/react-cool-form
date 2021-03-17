import isEmptyObject from "./isEmptyObject";

describe("isEmptyObject", () => {
  it("should work correctly", () => {
    expect(isEmptyObject(undefined)).toBeFalsy();
    expect(isEmptyObject(null)).toBeFalsy();
    expect(isEmptyObject(NaN)).toBeFalsy();
    expect(isEmptyObject(true)).toBeFalsy();
    expect(isEmptyObject(1)).toBeFalsy();
    expect(isEmptyObject("")).toBeFalsy();
    expect(isEmptyObject(new Date())).toBeFalsy();
    expect(isEmptyObject(() => null)).toBeFalsy();
    expect(isEmptyObject([])).toBeFalsy();
    expect(isEmptyObject({ test: "" })).toBeFalsy();
    expect(isEmptyObject({})).toBeTruthy();
  });
});
