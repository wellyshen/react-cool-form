import isAsyncFunction from "../isAsyncFunction";

describe("isAsyncFunction", () => {
  it("should work correctly", () => {
    expect(isAsyncFunction(undefined)).toBeFalsy();
    expect(isAsyncFunction(null)).toBeFalsy();
    expect(isAsyncFunction(true)).toBeFalsy();
    expect(isAsyncFunction(1)).toBeFalsy();
    expect(isAsyncFunction("")).toBeFalsy();
    expect(isAsyncFunction([])).toBeFalsy();
    expect(isAsyncFunction({})).toBeFalsy();
    expect(isAsyncFunction(() => null)).toBeFalsy();
    expect(isAsyncFunction(async () => null)).toBeTruthy();
  });
});
