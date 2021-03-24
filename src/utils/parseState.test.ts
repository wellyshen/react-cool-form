import parseState from "./parseState";

describe("parseState", () => {
  const state = {
    values: { foo: "🍎" },
    touched: { foo: true },
    errors: { foo: "🍎" },
    isDirty: false,
    dirty: { foo: true },
    isValidating: false,
    isValid: true,
    isSubmitting: false,
    isSubmitted: false,
    submitCount: 0,
  };

  it('should return value correctly when no "path" parameter', () => {
    expect(parseState(undefined, state, undefined, undefined)).toBeUndefined();
    expect(parseState(undefined, state, undefined, undefined, true)).toEqual(
      state
    );
  });

  it("should return value with correctly format", () => {
    const {
      values: { foo: value },
      errors: { foo: error },
    } = state;
    expect(parseState("foo", state)).toBe(value);
    expect(parseState(["foo", "errors.foo"], state)).toEqual([value, error]);
    expect(parseState({ value: "foo", error: "errors.foo" }, state)).toEqual({
      value,
      error,
    });
  });

  it("should call path handler correctly", () => {
    const handler = jest.fn();
    const path = "foo";

    parseState(path, state, handler);
    expect(handler).toHaveBeenCalledWith(path);

    parseState([path], state, handler);
    expect(handler).toHaveBeenCalledWith(path);

    parseState({ foo: path }, state, handler);
    expect(handler).toHaveBeenCalledWith(path);
  });

  it("should call error handler correctly", () => {
    const handler = jest.fn();
    const path = "values.foo";
    const { foo } = state.values;

    parseState(path, state, undefined, handler);
    expect(handler).toHaveBeenCalledWith(path, foo);

    parseState([path], state, undefined, handler);
    expect(handler).toHaveBeenCalledWith(path, foo);

    parseState({ foo: path }, state, undefined, handler);
    expect(handler).toHaveBeenCalledWith(path, foo);
  });
});
