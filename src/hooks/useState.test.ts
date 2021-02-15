import { useReducer } from "react";
import { renderHook } from "@testing-library/react-hooks";

import useState from "./useState";

const forceUpdate = jest.fn();

jest.mock("react", () => ({
  ...(jest.requireActual("react") as object),
  useReducer: jest.fn(),
}));
(useReducer as jest.Mock).mockImplementation(() => [, forceUpdate]);

describe("useState", () => {
  const initialState = {
    values: { foo: "🍋" },
    touched: {},
    errors: {},
    dirty: {},
    isDirty: false,
    isValidating: false,
    isValid: true,
    isSubmitting: false,
    isSubmitted: false,
    submitCount: 0,
  };
  const renderHelper = (debug?: (state: any) => void) =>
    renderHook(() => useState(initialState, debug)).result.current;

  beforeEach(() => forceUpdate.mockClear());

  it("should set initial state correctly", () => {
    const { stateRef } = renderHelper();
    expect(stateRef.current).toEqual(initialState);
  });

  it("should set state and re-render correctly", () => {
    const { stateRef, setStateRef } = renderHelper();
    const nextState = {
      ...initialState,
      values: { foo: "🍎" },
      touched: { foo: true },
      errors: { foo: "Required" },
      isDirty: true,
      dirty: { foo: true },
      isValid: false,
      submitCount: 1,
    };

    setStateRef("", nextState);
    expect(stateRef.current).toEqual(nextState);
    expect(forceUpdate).toHaveBeenCalledTimes(1);

    setStateRef("", nextState);
    expect(forceUpdate).toHaveBeenCalledTimes(1);
  });

  it("should set state's values without re-render", () => {
    const { stateRef, setStateRef } = renderHelper();
    const foo = "🍎";
    const error = "Required";
    const isValidating = true;
    const isSubmitting = true;
    const isSubmitted = true;
    setStateRef("values.foo", foo);
    setStateRef("touched.foo", true);
    setStateRef("errors.foo", error);
    setStateRef("dirty.foo", true);
    setStateRef("isValidating", isValidating);
    setStateRef("isSubmitting", isSubmitting);
    setStateRef("isSubmitted", isSubmitted);
    expect(forceUpdate).not.toHaveBeenCalled();
    expect(stateRef.current).toEqual({
      values: { foo },
      touched: { foo: true },
      errors: { foo: error },
      isDirty: true,
      dirty: { foo: true },
      isValidating,
      isValid: false,
      isSubmitting,
      isSubmitted,
      submitCount: 1,
    });
  });

  it("should set state's values and re-render correctly", () => {
    const { stateRef, setStateRef, setUsedStateRef } = renderHelper();

    const foo = "🍎";
    setUsedStateRef("values.foo");
    setStateRef("values.foo", foo);
    setStateRef("values.foo", foo);
    expect(forceUpdate).toHaveBeenCalledTimes(2);

    setUsedStateRef("touched.foo");
    setStateRef("touched.foo", true);
    setStateRef("touched.foo", true);
    expect(forceUpdate).toHaveBeenCalledTimes(3);

    const error = "Required";
    setUsedStateRef("errors.foo");
    setStateRef("errors.foo", error);
    setStateRef("errors.foo", error);
    expect(forceUpdate).toHaveBeenCalledTimes(4);

    setUsedStateRef("dirty.foo");
    setStateRef("dirty.foo", true);
    setStateRef("dirty.foo", true);
    expect(forceUpdate).toHaveBeenCalledTimes(5);

    const isValidating = true;
    setUsedStateRef("isValidating");
    setStateRef("isValidating", isValidating);
    setStateRef("isValidating", isValidating);
    expect(forceUpdate).toHaveBeenCalledTimes(6);

    const isSubmitting = true;
    setUsedStateRef("isSubmitting");
    setStateRef("isSubmitting", isSubmitting);
    setStateRef("isSubmitting", isSubmitting);
    expect(forceUpdate).toHaveBeenCalledTimes(7);

    const isSubmitted = true;
    setUsedStateRef("isSubmitted");
    setStateRef("isSubmitted", isSubmitted);
    setStateRef("isSubmitted", isSubmitted);
    expect(forceUpdate).toHaveBeenCalledTimes(8);

    expect(stateRef.current).toEqual({
      values: { foo },
      touched: { foo: true },
      errors: { foo: error },
      isDirty: true,
      dirty: { foo: true },
      isValidating,
      isValid: false,
      isSubmitting,
      isSubmitted,
      submitCount: 1,
    });
  });

  it("should set state.isValid and state.isDirty without re-render", () => {
    const { setStateRef } = renderHelper();
    setStateRef("errors", { foo: "Required" });
    setStateRef("dirty", { foo: true });
    expect(forceUpdate).not.toHaveBeenCalled();
  });

  it("should set state.isValid, state.isDirty and re-render correctly", () => {
    const { setStateRef, setUsedStateRef } = renderHelper();

    setUsedStateRef("isValid");
    setStateRef("errors", { foo: "Required" });
    setStateRef("errors", { foo: "Required" });
    expect(forceUpdate).toHaveBeenCalledTimes(1);

    setUsedStateRef("isDirty");
    setStateRef("dirty", { foo: true });
    setStateRef("dirty", { foo: true });
    expect(forceUpdate).toHaveBeenCalledTimes(2);
  });

  it("should re-render due to match parent path (parent = used-state)", () => {
    const { setStateRef, setUsedStateRef } = renderHelper();

    setUsedStateRef("values");
    setStateRef("values.foo", "🍎");
    expect(forceUpdate).toHaveBeenCalledTimes(1);

    setUsedStateRef("touched");
    setStateRef("touched.foo", true);
    expect(forceUpdate).toHaveBeenCalledTimes(2);

    setUsedStateRef("errors");
    setStateRef("errors.foo", "Required");
    expect(forceUpdate).toHaveBeenCalledTimes(3);

    setUsedStateRef("dirty");
    setStateRef("dirty.foo", true);
    expect(forceUpdate).toHaveBeenCalledTimes(4);
  });

  it("should re-render due to match parent path (parent = set-state)", () => {
    const { setStateRef, setUsedStateRef } = renderHelper();

    setUsedStateRef("values.foo");
    setStateRef("values", { foo: "🍎" });
    expect(forceUpdate).toHaveBeenCalledTimes(1);

    setUsedStateRef("touched.foo");
    setStateRef("touched.foo", { foo: true });
    expect(forceUpdate).toHaveBeenCalledTimes(2);

    setUsedStateRef("errors.foo");
    setStateRef("errors", { foo: "Required" });
    expect(forceUpdate).toHaveBeenCalledTimes(3);

    setUsedStateRef("dirty.foo");
    setStateRef("dirty", { foo: true });
    expect(forceUpdate).toHaveBeenCalledTimes(4);
  });

  it("should skip re-render", () => {
    const { setStateRef, setUsedStateRef } = renderHelper();
    setUsedStateRef("values.foo");
    setStateRef("values.foo", "🍎", { shouldUpdate: false });
    expect(forceUpdate).not.toHaveBeenCalled();
  });

  it('should re-render correctly based on the "fieldPath"', () => {
    const { setStateRef, setUsedStateRef } = renderHelper();
    const fieldPath = "values.some-value";

    setUsedStateRef(fieldPath);
    setStateRef("values.foo", "🍎");
    expect(forceUpdate).not.toHaveBeenCalled();

    setStateRef("values.foo", "🍎", { fieldPath });
    expect(forceUpdate).toHaveBeenCalledTimes(1);
  });

  it("should call debug callback correctly when set state", () => {
    const debug = jest.fn();
    const { setStateRef } = renderHelper(debug);
    const state = {
      ...initialState,
      values: { ...initialState.values, foo: "🍎" },
    };

    setStateRef("", state);
    setStateRef("", state);
    expect(debug).toHaveBeenCalledTimes(1);
    expect(debug).toHaveBeenCalledWith(state);
  });

  it("should call debug callback correctly when set state's value", () => {
    const debug = jest.fn();
    const { setStateRef } = renderHelper(debug);
    const errors = { foo: "Required" };

    setStateRef("errors", errors);
    setStateRef("errors", errors);
    expect(debug).toHaveBeenCalledTimes(1);
    expect(debug).toHaveBeenCalledWith({
      ...initialState,
      errors,
      isValid: false,
    });
  });

  it("should unset used state", () => {
    const { setStateRef, setUsedStateRef } = renderHelper();

    setUsedStateRef("values.foo");
    setStateRef("values.foo", "🍎");
    expect(forceUpdate).toHaveBeenCalledTimes(1);

    setUsedStateRef("values.foo", true);
    setStateRef("values.foo", "🍎");
    expect(forceUpdate).toHaveBeenCalledTimes(1);
  });
});
