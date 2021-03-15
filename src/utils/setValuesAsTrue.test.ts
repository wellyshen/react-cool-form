import setValuesAsTrue from "./setValuesAsTrue";

describe("setValuesAsTrue", () => {
  it("should work correctly", () => {
    expect(setValuesAsTrue({})).toEqual({});
    expect(setValuesAsTrue({ foo: {} })).toEqual({ foo: {} });
    expect(setValuesAsTrue({ foo: [] })).toEqual({ foo: [] });
    expect(setValuesAsTrue({ foo: true })).toEqual({ foo: true });
    expect(setValuesAsTrue({ foo: undefined })).toEqual({ foo: true });
    expect(setValuesAsTrue({ foo: null })).toEqual({ foo: true });
    expect(setValuesAsTrue({ foo: NaN })).toEqual({ foo: true });
    expect(setValuesAsTrue({ foo: 1 })).toEqual({ foo: true });
    expect(setValuesAsTrue({ foo: "" })).toEqual({ foo: true });
    expect(setValuesAsTrue({ foo: new Date() })).toEqual({ foo: true });
    expect(setValuesAsTrue({ foo: () => null })).toEqual({ foo: true });
    expect(setValuesAsTrue({ foo: [true] })).toEqual({ foo: [true] });
    expect(setValuesAsTrue({ foo: [undefined] })).toEqual({ foo: [true] });
    expect(setValuesAsTrue({ foo: [null] })).toEqual({ foo: [true] });
    expect(setValuesAsTrue({ foo: [NaN] })).toEqual({ foo: [true] });
    expect(setValuesAsTrue({ foo: [1] })).toEqual({ foo: [true] });
    expect(setValuesAsTrue({ foo: [""] })).toEqual({ foo: [true] });
    expect(setValuesAsTrue({ foo: [new Date()] })).toEqual({ foo: [true] });
    expect(setValuesAsTrue({ foo: [() => null] })).toEqual({ foo: [true] });
    expect(setValuesAsTrue({ foo: { bar: [{ baz: false }, false] } })).toEqual({
      foo: { bar: [{ baz: true }, true] },
    });
  });
});
