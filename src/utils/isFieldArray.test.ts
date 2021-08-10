import isFieldArray from "./isFieldArray";

describe("isFieldArray", () => {
  it("should work correctly", () => {
    const value = { fields: {}, update: () => null };
    const foo = new Map([
      ["foo", value],
      ["foo[0].a[0]", value],
    ]);

    expect(isFieldArray(foo, "foo[0].a")).toBe("foo");

    expect(isFieldArray(foo, "foo[0].a[0].b")).toBe("foo[0].a[0]");

    expect(isFieldArray(foo, "bar[0].a")).toBeUndefined();

    let callback = jest.fn();

    isFieldArray(foo, "foo[0].a", callback);
    expect(callback).toHaveBeenCalledWith("foo");

    callback = jest.fn();

    isFieldArray(foo, "bar[0].a", callback);
    expect(callback).not.toHaveBeenCalled();
  });
});
