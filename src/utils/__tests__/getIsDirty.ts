import getIsDirty from "../getIsDirty";

describe("getIsDirty", () => {
  it("should work correctly", () => {
    expect(getIsDirty({ foo: true })).toBeTruthy();
    expect(getIsDirty({ foo: { bar: { baz: true } } })).toBeTruthy();
    expect(getIsDirty({})).toBeFalsy();
  });
});
