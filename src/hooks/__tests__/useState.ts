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
    values: {},
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
  const renderHelper = () =>
    renderHook(() => useState(initialState)).result.current;

  beforeEach(() => forceUpdate.mockClear());

  it("should...", () => {
    const { setStateRef, setUsedStateRef } = renderHelper();
    setUsedStateRef("values.a");
    setStateRef("values.a", "test");
    expect(forceUpdate).toHaveBeenCalledTimes(1);
  });
});
