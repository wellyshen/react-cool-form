import getIsDirty from "./getIsDirty";

describe("getIsDirty", () => {
  it("should work correctly", () => {
    expect(getIsDirty({})).toBeFalsy();
    expect(getIsDirty({ foo: true })).toBeTruthy();
    expect(getIsDirty({ foo: [true] })).toBeTruthy();
    expect(getIsDirty({ foo: {} })).toBeFalsy();
    expect(getIsDirty({ foo: { bar: { baz: true } } })).toBeTruthy();
    expect(getIsDirty({ foo: { bar: { baz: [true] } } })).toBeTruthy();
    expect(getIsDirty({ foo: { bar: {} } })).toBeFalsy();
    expect(getIsDirty({ foo: { bar: [{ baz: true }] } })).toBeTruthy();
    expect(getIsDirty({ foo: { bar: [{ baz: [true] }] } })).toBeTruthy();
    expect(getIsDirty({})).toBeFalsy();
  });
});
