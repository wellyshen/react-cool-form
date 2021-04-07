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
    const { stateRef, setStateRef, setUsedState } = renderHelper();
    let state = {
      ...initialState,
      values: { foo: "🍎" },
      touched: { foo: true },
      errors: { foo: "Required" },
      isDirty: true,
      dirty: { foo: true },
      isValid: false,
      submitCount: 1,
    };

    setStateRef("", state);
    expect(stateRef.current).toEqual(state);
    expect(forceUpdate).not.toHaveBeenCalled();

    state = { ...state, values: { foo: "🍋" } };
    setUsedState({ values: true });
    setStateRef("", state);
    expect(forceUpdate).toHaveBeenCalledTimes(1);

    setStateRef("", state);
    expect(forceUpdate).toHaveBeenCalledTimes(1);
  });

  it("should set state without re-render", () => {
    const { setStateRef } = renderHelper();
    setStateRef("", initialState);
    expect(forceUpdate).not.toHaveBeenCalled();
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
    const { stateRef, setStateRef, setUsedState } = renderHelper();

    const value = "🍎";
    setUsedState({ "values.foo": true });
    setUsedState({ "values.bar": true });
    setStateRef("values.foo", value);
    setStateRef("values.foo", value);
    setStateRef("values.bar", value);
    expect(forceUpdate).toHaveBeenCalledTimes(3);

    setUsedState({ "touched.foo": true });
    setUsedState({ "touched.bar": true });
    setStateRef("touched.foo", true);
    setStateRef("touched.foo", true);
    setStateRef("touched.bar", true);
    expect(forceUpdate).toHaveBeenCalledTimes(5);

    const error = "Required";
    setUsedState({ "errors.foo": true });
    setUsedState({ "errors.bar": true });
    setStateRef("errors.foo", error);
    setStateRef("errors.foo", error);
    setStateRef("errors.bar", error);
    expect(forceUpdate).toHaveBeenCalledTimes(7);

    setUsedState({ "dirty.foo": true });
    setUsedState({ "dirty.bar": true });
    setStateRef("dirty.foo", true);
    setStateRef("dirty.foo", true);
    setStateRef("dirty.bar", true);
    expect(forceUpdate).toHaveBeenCalledTimes(9);

    const isValidating = true;
    setUsedState({ isValidating: true });
    setStateRef("isValidating", isValidating);
    setStateRef("isValidating", isValidating);
    expect(forceUpdate).toHaveBeenCalledTimes(10);

    const isSubmitting = true;
    setUsedState({ isSubmitting: true });
    setStateRef("isSubmitting", isSubmitting);
    setStateRef("isSubmitting", isSubmitting);
    expect(forceUpdate).toHaveBeenCalledTimes(11);

    const isSubmitted = true;
    setUsedState({ isSubmitted: true });
    setStateRef("isSubmitted", isSubmitted);
    setStateRef("isSubmitted", isSubmitted);
    expect(forceUpdate).toHaveBeenCalledTimes(12);

    expect(stateRef.current).toEqual({
      values: { foo: value, bar: value },
      touched: { foo: true, bar: true },
      errors: { foo: error, bar: error },
      isDirty: true,
      dirty: { foo: true, bar: true },
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
    const { setStateRef, setUsedState } = renderHelper();

    setUsedState({ isValid: true });
    setStateRef("errors", { foo: "Required" });
    setStateRef("errors", { foo: "Required" });
    expect(forceUpdate).toHaveBeenCalledTimes(1);

    setUsedState({ isDirty: true });
    setStateRef("dirty", { foo: true });
    setStateRef("dirty", { foo: true });
    expect(forceUpdate).toHaveBeenCalledTimes(2);
  });

  it("should re-render due to match parent path (parent = used-state)", () => {
    const { setStateRef, setUsedState } = renderHelper();

    setUsedState({ values: true });
    setStateRef("values.foo", "🍎");
    expect(forceUpdate).toHaveBeenCalledTimes(1);

    setUsedState({ touched: true });
    setStateRef("touched.foo", true);
    expect(forceUpdate).toHaveBeenCalledTimes(2);

    setUsedState({ errors: true });
    setStateRef("errors.foo", "Required");
    expect(forceUpdate).toHaveBeenCalledTimes(3);

    setUsedState({ dirty: true });
    setStateRef("dirty.foo", true);
    expect(forceUpdate).toHaveBeenCalledTimes(4);
  });

  it("should re-render due to match parent path (parent = set-state)", () => {
    const { setStateRef, setUsedState } = renderHelper();

    setUsedState({ "values.foo": true });
    setStateRef("values", { foo: "🍎" });
    expect(forceUpdate).toHaveBeenCalledTimes(1);

    setUsedState({ "touched.foo": true });
    setStateRef("touched.foo", { foo: true });
    expect(forceUpdate).toHaveBeenCalledTimes(2);

    setUsedState({ "errors.foo": true });
    setStateRef("errors", { foo: "Required" });
    expect(forceUpdate).toHaveBeenCalledTimes(3);

    setUsedState({ "dirty.foo": true });
    setStateRef("dirty", { foo: true });
    expect(forceUpdate).toHaveBeenCalledTimes(4);
  });

  it("should skip re-render when setting state", () => {
    const debug = jest.fn();
    const { setStateRef, setUsedState } = renderHelper(debug);
    setUsedState({ values: true });
    setStateRef(
      "",
      { ...initialState, values: { foo: "🍎" } },
      { shouldSkipUpdate: false }
    );
    expect(debug).toHaveBeenCalled();
    expect(forceUpdate).not.toHaveBeenCalled();
  });

  it("should skip re-render when setting state's value", () => {
    const debug = jest.fn();
    const { setStateRef, setUsedState } = renderHelper(debug);
    setUsedState({ values: true });
    setStateRef("values.foo", "🍎", { shouldSkipUpdate: false });
    expect(debug).toHaveBeenCalled();
    expect(forceUpdate).not.toHaveBeenCalled();
  });

  it('should re-render correctly based on "fieldPath"', () => {
    const { setStateRef, setUsedState } = renderHelper();
    const fieldPath = "values.some-value";

    setUsedState({ [fieldPath]: true });
    setStateRef("values.foo", "🍎");
    expect(forceUpdate).not.toHaveBeenCalled();

    setStateRef("values.foo", "🍎", { fieldPath });
    expect(forceUpdate).toHaveBeenCalledTimes(1);
  });

  it("should call debug correctly when setting state", () => {
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

  it("should call debug correctly when setting state's value", () => {
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

  it("should subscribe/unsubscribe observers correctly", () => {
    const {
      subscribeObserver,
      unsubscribeObserver,
      setStateRef,
    } = renderHelper();
    const path = "values.foo";
    const foo = "🍎";
    const observer = { usedState: { [path]: true }, notify: forceUpdate };

    subscribeObserver(observer);
    setStateRef(path, foo);
    expect(forceUpdate).toHaveBeenCalledWith({
      ...initialState,
      values: { foo },
    });

    unsubscribeObserver(observer);
    setStateRef(path, foo);
    expect(forceUpdate).toHaveBeenCalledTimes(1);
  });
});
