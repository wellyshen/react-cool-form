import { render, fireEvent, waitFor, screen } from "@testing-library/react";

import { ControlledConfig, ControlledReturn } from "./types";
import useForm from "./useForm";
import useControlled from "./useControlled";

interface Config extends Omit<ControlledConfig<any>, "name | formId"> {
  children: (props: ControlledReturn<any[]>) => JSX.Element | null;
  name: string;
  defaultValues: Record<string, any>;
  onSubmit: (values: any) => void;
}

type Props = Partial<Config>;

const Form = ({
  children,
  name = "foo",
  defaultValues,
  onSubmit = () => null,
  ...rest
}: Props) => {
  const { form } = useForm({
    id: "form-1",
    defaultValues,
    onSubmit: (values) => onSubmit(values),
  });
  const props = useControlled(name, { formId: "form-1", ...rest });

  return (
    <form data-testid="form" ref={form}>
      {children ? children(props) : null}
    </form>
  );
};

const renderHelper = ({ children, ...rest }: Props = {}) => {
  let api: ControlledReturn<any[]>;

  render(
    <Form {...rest}>
      {(props) => {
        api = props;
        return children ? children(props) : null;
      }}
    </Form>
  );

  // @ts-expect-error
  return api;
};

/* const CustomField = ({ value, onChange }: any) => (
  <button
    data-testid="custom"
    onClick={(e) => onChange(e.target.value)}
    type="button"
  >
    {value}
  </button>
); */

describe("useControlled", () => {
  const getByTestId = screen.getByTestId as any;
  const onSubmit = jest.fn();
  const value = "🍎";

  it("should throw missing name error", () => {
    // @ts-expect-error
    expect(() => useControlled()).toThrow(
      '💡 react-cool-form > useControlled: Missing the "name" parameter.'
    );
  });

  it("should throw form id errors", () => {
    expect(() => useControlled("foo")).toThrow(
      '💡 react-cool-form > useControlled: Missing the "formId" option. See: https://react-cool-form.netlify.app/docs/api-reference/use-controlled#formid'
    );

    expect(() => useControlled("foo", { formId: "form-1" })).toThrow(
      '💡 react-cool-form > useControlled: You must provide the corresponding ID to the "useForm" hook. See: https://react-cool-form.netlify.app/docs/api-reference/use-form#id'
    );
  });

  it("should return props correctly", () => {
    const props = renderHelper({ anyProp: () => null });
    expect(props).toEqual({
      fieldProps: {
        name: expect.any(String),
        value: expect.anything(),
        onChange: expect.any(Function),
        onBlur: expect.any(Function),
        anyProp: expect.any(Function),
      },
      meta: expect.any(Object),
      getState: expect.any(Function),
      setValue: expect.any(Function),
      setTouched: expect.any(Function),
      setDirty: expect.any(Function),
      setError: expect.any(Function),
      clearErrors: expect.any(Function),
      runValidation: expect.any(Function),
    });
  });

  it("should not set default value automatically", () => {
    const { meta } = renderHelper({
      children: ({ fieldProps }: ControlledReturn<any>) => (
        <input {...fieldProps} />
      ),
    });
    expect(meta.value).toBeUndefined();
  });

  it.each(["form", "controlled"])(
    "should set default value from %s option",
    async (type) => {
      const { meta } = renderHelper({
        defaultValues: type === "form" ? { foo: value } : undefined,
        defaultValue: type === "controlled" ? value : undefined,
        onSubmit,
        children: ({ fieldProps }: ControlledReturn<any[]>) => (
          <input data-testid="foo" {...fieldProps} />
        ),
      });
      expect(getByTestId("foo").value).toBe(value);
      expect(meta.value).toBe(value);
      fireEvent.submit(getByTestId("form"));
      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith({ foo: value })
      );
    }
  );

  /* it("should handle native field(s) change correctly", async () => {
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
  }); */
});
