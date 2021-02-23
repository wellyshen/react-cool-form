import useControlled from "./useControlled";

/* const CustomField = ({ value, onChange }: any) => (
  <button
    data-testid="custom"
    // @ts-expect-error
    onClick={(e) => onChange(e.target.value)}
    type="button"
  >
    {value}
  </button>
); */

describe("useControlled", () => {
  const value = "🍎";

  it("should warn for a missing name controller", () => {
    renderHelper({
      children: ({ controller }: Methods) => (
        // @ts-expect-error
        <input data-testid="foo" {...controller()} />
      ),
    });
    fireEvent.input(getByTestId("foo"));
    expect(console.warn).toHaveBeenCalledTimes(3);
    expect(console.warn).toHaveBeenNthCalledWith(
      1,
      '💡 react-cool-form > controller: Missing the "name" parameter.'
    );
  });

  it("should not warn for a missing name controller", () => {
    renderHelper({
      children: ({ controller }: Methods) => (
        <input data-testid="foo" {...controller("foo")} />
      ),
    });
    expect(console.warn).not.toHaveBeenCalled();
  });

  it("should not set default value automatically", async () => {
    renderHelper({
      onSubmit,
      children: ({ controller }: Methods) => (
        <input data-testid="foo" {...controller("foo")} />
      ),
    });
    fireEvent.submit(getByTestId("form"));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({}));
  });

  it.each(["form", "controller"])(
    "should set default value via %s option",
    async (type) => {
      renderHelper({
        defaultValues: type === "form" ? { foo: value } : undefined,
        onSubmit,
        children: ({ controller }: Methods) => (
          <input
            data-testid="foo"
            {...controller("foo", {
              defaultValue: type === "controller" ? value : undefined,
            })}
          />
        ),
      });
      expect((getByTestId("foo") as HTMLInputElement).value).toBe(value);
      fireEvent.submit(getByTestId("form"));
      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith({ foo: value })
      );
    }
  );

  it("should handle native field(s) change correctly", async () => {
    renderHelper({
      defaultValues: { text: "", checkboxes: [], selects: [] },
      onSubmit,
      children: ({ controller }: Methods) => (
        <>
          <input data-testid="text" {...controller("text")} />
          <input
            data-testid="checkboxes-0"
            {...controller("checkboxes")}
            type="checkbox"
            value="🍎"
          />
          <input
            data-testid="checkboxes-1"
            {...controller("checkboxes")}
            type="checkbox"
            value="🍋"
          />
          <select data-testid="selects" name="selects" multiple>
            <option data-testid="selects-0" value="🍎">
              🍎
            </option>
            <option data-testid="selects-1" value="🍋">
              🍋
            </option>
          </select>
        </>
      ),
    });
    fireEvent.input(getByTestId("text"), { target: { value } });
    const checkboxes0 = getByTestId("checkboxes-0");
    userEvent.click(checkboxes0);
    const selects0 = getByTestId("selects-0");
    userEvent.selectOptions(getByTestId("selects"), [selects0.value]);
    fireEvent.submit(getByTestId("form"));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        text: value,
        checkboxes: [checkboxes0.value],
        selects: [selects0.value],
      })
    );
  });

  it("should handle custom field change correctly", async () => {
    renderHelper({
      defaultValues: { foo: 0 },
      onSubmit,
      children: ({ controller }: Methods) => (
        <CustomField {...controller("foo")} />
      ),
    });
    fireEvent.click(getByTestId("custom"), { target: { value } });
    fireEvent.submit(getByTestId("form"));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ foo: value }));
  });

  it("should run controller validation", async () => {
    const errors = { foo: "Required" };
    const { getState } = renderHelper({
      defaultValues: { foo: "" },
      onSubmit,
      onError,
      children: ({ controller }: Methods) => (
        <input
          data-testid="foo"
          {...controller("foo", {
            validate: async (val: string) => (!val.length ? errors.foo : false),
          })}
        />
      ),
    });
    const form = getByTestId("form");
    const foo = getByTestId("foo");

    fireEvent.submit(form);
    expect(getState("isValidating")).toBeTruthy();
    await waitFor(() => expect(onError).toHaveBeenCalledWith(errors));
    expect(getState("isValidating")).toBeFalsy();
    expect(getState("isValid")).toBeFalsy();

    fireEvent.input(foo, { target: { value } });
    fireEvent.submit(form);
    expect(getState("isValidating")).toBeTruthy();
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ foo: value });
      expect(onError).toHaveBeenCalledTimes(1);
    });
    expect(getState("errors")).toEqual({});
    expect(getState("isValidating")).toBeFalsy();
    expect(getState("isValid")).toBeTruthy();
  });
});
