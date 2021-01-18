import { renderHook } from "@testing-library/react-hooks";

import useForm from "./useForm";

describe("useForm", () => {
  const renderHelper = (config = {}) => renderHook(() => useForm(config));

  it("should set default values correctly", () => {
    const defaultValues = { foo: "🍎", bar: "🍋" };
    const { getState } = renderHelper({ defaultValues }).result.current;
    expect(getState("values", { watch: false })).toEqual(defaultValues);
  });
});
