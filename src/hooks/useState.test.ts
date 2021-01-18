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
    values: { name: "Welly" },
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
      values: { name: "🍎" },
      touched: { name: true },
      errors: { name: "Required" },
      isDirty: true,
      dirty: { name: true },
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
    const name = "🍎";
    const error = "Required";
    const isValidating = true;
    const isSubmitting = true;
    const isSubmitted = true;
    setStateRef("values.name", name);
    setStateRef("touched.name", true);
    setStateRef("errors.name", error);
    setStateRef("dirty.name", true);
    setStateRef("isValidating", isValidating);
    setStateRef("isSubmitting", isSubmitting);
    setStateRef("isSubmitted", isSubmitted);
    expect(forceUpdate).not.toHaveBeenCalled();
    expect(stateRef.current).toEqual({
      values: { name },
      touched: { name: true },
      errors: { name: error },
      isDirty: true,
      dirty: { name: true },
      isValidating,
      isValid: false,
      isSubmitting,
      isSubmitted,
      submitCount: 1,
    });
  });

  it("should set state's values and re-render correctly", () => {
    const { stateRef, setStateRef, setUsedStateRef } = renderHelper();

    const name = "🍎";
    setUsedStateRef("values.name");
    setStateRef("values.name", name);
    setStateRef("values.name", name);
    expect(forceUpdate).toHaveBeenCalledTimes(2);

    setUsedStateRef("touched.name");
    setStateRef("touched.name", true);
    setStateRef("touched.name", true);
    expect(forceUpdate).toHaveBeenCalledTimes(3);

    const error = "Required";
    setUsedStateRef("errors.name");
    setStateRef("errors.name", error);
    setStateRef("errors.name", error);
    expect(forceUpdate).toHaveBeenCalledTimes(4);

    setUsedStateRef("dirty.name");
    setStateRef("dirty.name", true);
    setStateRef("dirty.name", true);
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
      values: { name },
      touched: { name: true },
      errors: { name: error },
      isDirty: true,
      dirty: { name: true },
      isValidating,
      isValid: false,
      isSubmitting,
      isSubmitted,
      submitCount: 1,
    });
  });

  it("should set state.isValid and state.isDirty without re-render", () => {
    const { setStateRef } = renderHelper();
    setStateRef("errors", { name: "Required" });
    setStateRef("dirty", { name: true });
    expect(forceUpdate).not.toHaveBeenCalled();
  });

  it("should set state.isValid, state.isDirty and re-render correctly", () => {
    const { setStateRef, setUsedStateRef } = renderHelper();

    setUsedStateRef("isValid");
    setStateRef("errors", { name: "Required" });
    setStateRef("errors", { name: "Required" });
    expect(forceUpdate).toHaveBeenCalledTimes(1);

    setUsedStateRef("isDirty");
    setStateRef("dirty", { name: true });
    setStateRef("dirty", { name: true });
    expect(forceUpdate).toHaveBeenCalledTimes(2);
  });

  it("should re-render due to match parent path (parent = used-state)", () => {
    const { setStateRef, setUsedStateRef } = renderHelper();

    setUsedStateRef("values");
    setStateRef("values.name", "🍎");
    expect(forceUpdate).toHaveBeenCalledTimes(1);

    setUsedStateRef("touched");
    setStateRef("touched.name", true);
    expect(forceUpdate).toHaveBeenCalledTimes(2);

    setUsedStateRef("errors");
    setStateRef("errors.name", "Required");
    expect(forceUpdate).toHaveBeenCalledTimes(3);

    setUsedStateRef("dirty");
    setStateRef("dirty.name", true);
    expect(forceUpdate).toHaveBeenCalledTimes(4);
  });

  it("should re-render due to match parent path (parent = set-state)", () => {
    const { setStateRef, setUsedStateRef } = renderHelper();

    setUsedStateRef("values.name");
    setStateRef("values", { name: "🍎" });
    expect(forceUpdate).toHaveBeenCalledTimes(1);

    setUsedStateRef("touched.name");
    setStateRef("touched.name", { name: true });
    expect(forceUpdate).toHaveBeenCalledTimes(2);

    setUsedStateRef("errors.name");
    setStateRef("errors", { name: "Required" });
    expect(forceUpdate).toHaveBeenCalledTimes(3);

    setUsedStateRef("dirty.name");
    setStateRef("dirty", { name: true });
    expect(forceUpdate).toHaveBeenCalledTimes(4);
  });

  it("should skip re-render", () => {
    const { setStateRef, setUsedStateRef } = renderHelper();
    setUsedStateRef("values.name");
    setStateRef("values.name", "🍎", { shouldUpdate: false });
    expect(forceUpdate).not.toHaveBeenCalled();
  });

  it('should re-render correctly based on the "fieldPath"', () => {
    const { setStateRef, setUsedStateRef } = renderHelper();
    const fieldPath = "values.some-value";

    setUsedStateRef(fieldPath);
    setStateRef("values.name", "🍎");
    expect(forceUpdate).not.toHaveBeenCalled();

    setStateRef("values.name", "🍎", { fieldPath });
    expect(forceUpdate).toHaveBeenCalledTimes(1);
  });

  it("should call debug function correctly when set state", () => {
    const debug = jest.fn();
    const { setStateRef } = renderHelper(debug);
    const state = {
      ...initialState,
      values: { ...initialState.values, name: "🍎" },
    };

    setStateRef("", state);
    expect(debug).toHaveBeenNthCalledWith(1, state);

    setStateRef("", state);
    expect(debug).toHaveBeenCalledTimes(1);
  });

  it("should call debug function correctly when set state's value", () => {
    const debug = jest.fn();
    const { setStateRef, setUsedStateRef } = renderHelper(debug);
    const errors = { name: "Required" };

    setUsedStateRef("errors");
    setStateRef("errors", errors);
    expect(debug).toHaveBeenNthCalledWith(1, {
      ...initialState,
      errors,
      isValid: false,
    });

    setStateRef("errors", errors);
    expect(debug).toHaveBeenCalledTimes(1);
  });

  it("should unset used state", () => {
    const { setStateRef, setUsedStateRef } = renderHelper();

    setUsedStateRef("values.name");
    setStateRef("values.name", "🍎");
    expect(forceUpdate).toHaveBeenCalledTimes(1);

    setUsedStateRef("values.name", true);
    setStateRef("values.name", "🍎");
    expect(forceUpdate).toHaveBeenCalledTimes(1);
  });
});
