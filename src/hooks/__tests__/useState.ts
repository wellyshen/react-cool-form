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
    values: { nest: { name: "Welly" } },
    touched: {},
    errors: {},
    isDirty: false,
    dirtyFields: {},
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
    const state = {
      ...stateRef.current,
      values: {
        ...stateRef.current.values,
        nest: { name: "Wei" },
      },
    };
    setStateRef("", state);
    expect(stateRef.current).toEqual(state);
    expect(forceUpdate).toHaveBeenCalledTimes(1);
  });

  it("should do deep-equal checking for the same state", () => {
    const { stateRef, setStateRef } = renderHelper();
    const state = {
      ...stateRef.current,
      values: {
        ...stateRef.current.values,
        nest: { name: "Wei" },
      },
    };
    setStateRef("", state);
    expect(stateRef.current).toEqual(state);
    expect(stateRef.current).toEqual(state);
    expect(forceUpdate).toHaveBeenCalledTimes(1);
  });

  it("should set state's value and re-render correctly (exact match)", () => {
    const { stateRef, setStateRef, setUsedStateRef } = renderHelper();
    const name = "Wei";
    setUsedStateRef("values.nest.name");
    setStateRef("values.nest.name", name);
    expect(stateRef.current.values).toEqual({
      ...stateRef.current.values,
      nest: { ...stateRef.current.values.nest, name },
    });
    expect(forceUpdate).toHaveBeenCalledTimes(1);

    setUsedStateRef("isSubmitted");
    setStateRef("isSubmitted", true);
    expect(stateRef.current.isSubmitted).toBeTruthy();
    expect(forceUpdate).toHaveBeenCalledTimes(2);
  });

  it("should set state's value and re-render correctly (used parent match)", () => {
    const { stateRef, setStateRef, setUsedStateRef } = renderHelper();
    const name = "Wei";
    setUsedStateRef("values");
    setStateRef("values.nest.name", name);
    expect(stateRef.current.values).toEqual({
      ...stateRef.current.values,
      nest: { ...stateRef.current.values.nest, name },
    });
    expect(forceUpdate).toHaveBeenCalledTimes(1);
  });

  it("should set state's value and re-render correctly (set parent match)", () => {
    const { stateRef, setStateRef, setUsedStateRef } = renderHelper();
    const value = { name: "Wei" };
    setUsedStateRef("values.nest.name");
    setStateRef("values", value);
    expect(stateRef.current.values).toEqual(value);
    expect(forceUpdate).toHaveBeenCalledTimes(1);
  });

  it("should do deep-equal checking for the same state.<key>", () => {
    const { setStateRef, setUsedStateRef } = renderHelper();
    const errors = { nest: { name: "Required" } };
    setUsedStateRef("errors");
    setStateRef("errors", errors);
    setStateRef("errors", errors);
    expect(forceUpdate).toHaveBeenCalledTimes(1);

    setUsedStateRef("isSubmitted");
    setStateRef("isSubmitted", true);
    expect(forceUpdate).toHaveBeenCalledTimes(2);
  });

  it("should not deep-equal checking for the same state.values", () => {
    const { setStateRef, setUsedStateRef } = renderHelper();
    setUsedStateRef("values.nest.name");
    setStateRef("values.nest.name", "Wei");
    setStateRef("values.nest.name", "Wei");
    expect(forceUpdate).toHaveBeenCalledTimes(2);
  });

  it("should skip re-render", () => {
    const { setStateRef, setUsedStateRef } = renderHelper();
    setUsedStateRef("values.nest.name");
    setStateRef("values.nest.name", "Wei", { shouldUpdate: false });
    expect(forceUpdate).not.toHaveBeenCalled();
  });

  it('should re-render correctly based on the "fieldPath"', () => {
    const { setStateRef, setUsedStateRef } = renderHelper();
    const fieldPath = "values.nest.some-value";
    setUsedStateRef(fieldPath);
    setStateRef("values.nest.name", "Wei");
    expect(forceUpdate).not.toHaveBeenCalled();

    setStateRef("values.nest.name", "Wei", { fieldPath });
    expect(forceUpdate).toHaveBeenCalledTimes(1);
  });

  it("should call debug function correctly when set state", () => {
    const debug = jest.fn();
    const { setStateRef } = renderHelper(debug);
    const state = {
      ...initialState,
      values: {
        ...initialState.values,
        nest: { name: "Wei" },
      },
    };
    setStateRef("", state);
    expect(debug).toHaveBeenNthCalledWith(1, state);

    setStateRef("", state);
    expect(debug).toHaveBeenCalledTimes(1);
  });

  it("should call debug function correctly when set state's value", () => {
    const debug = jest.fn();
    const { setStateRef, setUsedStateRef } = renderHelper(debug);
    const errors = { nest: { name: "Required" } };
    const state = { ...initialState, errors, isValid: false };
    setUsedStateRef("errors");
    setStateRef("errors", errors);
    expect(debug).toHaveBeenNthCalledWith(1, state);

    setStateRef("errors", errors);
    expect(debug).toHaveBeenCalledTimes(1);
  });

  it.todo("should set state.isDirty correctly");
  it.todo("should set state.isValid correctly");
  it.todo("should set state.submitCount correctly");
});
