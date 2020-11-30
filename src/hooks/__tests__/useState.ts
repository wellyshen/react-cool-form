import { useReducer } from "react";
import { renderHook } from "@testing-library/react-hooks";

import useState from "../useState";

const forceUpdate = jest.fn();

jest.mock("react", () => ({
  ...(jest.requireActual("react") as object),
  useReducer: jest.fn(),
}));
// eslint-disable-next-line no-sparse-arrays
(useReducer as jest.Mock).mockImplementation(() => [, forceUpdate]);

describe("useState", () => {
  const initialState = {
    values: { name: "Welly" },
    touched: {},
    errors: {},
    dirtyFields: {},
    isDirty: false,
    isValidating: false,
    isValid: true,
    isSubmitting: false,
    isSubmitted: false,
    submitCount: 0,
  };
  const nextState = {
    ...initialState,
    values: { name: "Wei-Yu-Yu" },
    touched: { name: true },
    errors: { name: "Required" },
    isDirty: true,
    dirtyFields: { name: true },
    isValid: false,
    submitCount: 1,
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
    setStateRef("", nextState);
    expect(stateRef.current).toEqual(nextState);
    expect(forceUpdate).toHaveBeenCalledTimes(1);
  });

  it("should do deep-equal checking for the same state", () => {
    const { setStateRef } = renderHelper();
    setStateRef("", nextState);
    setStateRef("", nextState);
    expect(forceUpdate).toHaveBeenCalledTimes(1);
  });

  it("should set state's values and re-render correctly", () => {
    const { stateRef, setStateRef, setUsedStateRef } = renderHelper();

    const name = "Wei-Yu-Yu";
    setUsedStateRef("values.name");
    setStateRef("values.name", name);
    expect(forceUpdate).toHaveBeenCalledTimes(1);

    setUsedStateRef("touched.name");
    setStateRef("touched.name", true);
    expect(forceUpdate).toHaveBeenCalledTimes(2);

    const error = "Required";
    setUsedStateRef("errors.name");
    setStateRef("errors.name", error);
    expect(forceUpdate).toHaveBeenCalledTimes(3);

    setUsedStateRef("dirtyFields.name");
    setStateRef("dirtyFields.name", true);
    expect(forceUpdate).toHaveBeenCalledTimes(4);

    const isValidating = true;
    setUsedStateRef("isValidating");
    setStateRef("isValidating", isValidating);
    expect(forceUpdate).toHaveBeenCalledTimes(5);

    const isSubmitting = true;
    setUsedStateRef("isSubmitting");
    setStateRef("isSubmitting", isSubmitting);
    expect(forceUpdate).toHaveBeenCalledTimes(6);

    const isSubmitted = true;
    setUsedStateRef("isSubmitted");
    setStateRef("isSubmitted", isSubmitted);
    expect(forceUpdate).toHaveBeenCalledTimes(7);

    expect(stateRef.current).toEqual({
      values: { name },
      touched: { name: true },
      errors: { name: error },
      isDirty: true,
      dirtyFields: { name: true },
      isValidating,
      isValid: false,
      isSubmitting,
      isSubmitted,
      submitCount: 1,
    });
  });

  it("should skip re-render", () => {
    const { setStateRef, setUsedStateRef } = renderHelper();
    setUsedStateRef("values.name");
    setStateRef("values.name", "Wei-Yu", { shouldUpdate: false });
    expect(forceUpdate).not.toHaveBeenCalled();
  });

  it('should re-render correctly based on the "fieldPath"', () => {
    const { setStateRef, setUsedStateRef } = renderHelper();
    const fieldPath = "values.some-value";

    setUsedStateRef(fieldPath);
    setStateRef("values.name", "Wei-Yu");
    expect(forceUpdate).not.toHaveBeenCalled();

    setStateRef("values.name", "Wei-Yu", { fieldPath });
    expect(forceUpdate).toHaveBeenCalledTimes(1);
  });

  it("should call debug function correctly when set state", () => {
    const debug = jest.fn();
    const { setStateRef } = renderHelper(debug);
    const state = {
      ...initialState,
      values: { ...initialState.values, name: "Wei-Yu" },
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
});
