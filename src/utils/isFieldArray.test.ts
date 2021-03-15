import isFieldArray from "./isFieldArray";

describe("isFieldArray", () => {
  it("should work correctly", () => {
    // @ts-expect-error
    expect(isFieldArray({ foo: true }, "foo[0].a")).toBe("foo");

    // @ts-expect-error
    expect(isFieldArray({ foo: true }, "bar[0].a")).toBeUndefined();

    let callback = jest.fn();
    // @ts-expect-error
    isFieldArray({ foo: true }, "foo[0].a", callback);
    expect(callback).toHaveBeenCalledWith("foo");

    callback = jest.fn();
    // @ts-expect-error
    isFieldArray({ foo: true }, "bar[0].a", callback);
    expect(callback).not.toHaveBeenCalled();
  });
});
