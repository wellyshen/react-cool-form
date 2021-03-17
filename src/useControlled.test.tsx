import {
  render,
  fireEvent,
  waitFor,
  screen,
  act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  ControlledConfig,
  FieldProps,
  GetState,
  Meta,
  RegisterField,
  Reset,
} from "./types";
import useForm from "./useForm";
import useFieldArray from "./useFieldArray";
import useControlled from "./useControlled";

interface API {
  fieldProps: FieldProps;
  meta: Meta;
  field: RegisterField;
  getState: GetState;
  reset: Reset;
}

interface Config extends ControlledConfig {
  children: (api: API) => JSX.Element | null;
  name: string;
  isFieldArray: boolean;
  defaultValues: Record<string, any>;
  onSubmit: (values: any) => void;
  onError: (errors: any) => void;
  onReset: (values: any) => void;
}

type Props = Partial<Config>;

const Form = ({
  children,
  name = "foo",
  isFieldArray,
  defaultValues,
  onSubmit = () => null,
  onError = () => null,
  onReset = () => null,
  ...rest
}: Props) => {
  const { form, field, getState, reset } = useForm({
    defaultValues,
    onSubmit: (values) => onSubmit(values),
    onError: (errors) => onError(errors),
    onReset: (values) => onReset(values),
  });
  const [fieldProps, meta] = useControlled(name, rest);
  useFieldArray(isFieldArray ? name : "x");

  return (
    <>
      <div>{meta.error ? meta.error : "not-error"}</div>
      <div>{meta.isTouched ? "touched" : "not-touched"}</div>
      <div>{meta.isDirty ? "dirty" : "not-dirty"}</div>
      <form data-testid="form" ref={form}>
        {children
          ? children({ fieldProps, meta, field, getState, reset })
          : null}
      </form>
    </>
  );
};

const CustomField = ({ value, onChange }: any) => (
  <button
    data-testid="foo"
    type="button"
    onClick={(e: any) => onChange(e.target.value)}
  >
    {value}
  </button>
);

const renderHelper = ({ children, ...rest }: Props = {}) => {
  let api: API;

  render(
    <Form {...rest}>
      {(a) => {
        api = a;
        return children ? children(a) : null;
      }}
    </Form>
  );

  // @ts-expect-error
  return api;
};

describe("useControlled", () => {
  console.warn = jest.fn();
  const getByTestId = screen.getByTestId as any;
  const onSubmit = jest.fn();
  const onError = jest.fn();
  const value = "🍎";

  beforeEach(() => jest.clearAllMocks());

  it("should throw missing name error", () => {
    // @ts-expect-error
    expect(() => useControlled()).toThrow(
      '💡 react-cool-form > useControlled: Missing "name" parameter.'
    );
  });

  it("should throw form id errors", () => {
    expect(() => useControlled("foo", { formId: "form-1" })).toThrow(
      '💡 react-cool-form > useControlled: You must provide the corresponding ID to "useForm" hook. See: https://react-cool-form.netlify.app/docs/api-reference/use-form#id'
    );
  });

  it("should warn missing default value", () => {
    renderHelper({
      children: ({ fieldProps }: API) => (
        <input data-testid="foo" {...fieldProps} />
      ),
    });
    fireEvent.input(getByTestId("foo"), { target: { value } });
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith(
      '💡 react-cool-form > useControlled: Please provide a default value for "foo" field.'
    );
  });

  it("should warn missing default value for field-array", () => {
    renderHelper({
      isFieldArray: true,
      children: ({ fieldProps }: API) => (
        <input data-testid="foo" {...fieldProps} />
      ),
    });
    fireEvent.input(getByTestId("foo"), { target: { value } });
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith(
      '💡 react-cool-form > useControlled: Please provide a default value for "foo" field.'
    );
  });

  it.each(["form", "controlled"])(
    "should not warn missing default value",
    (type) => {
      renderHelper({
        defaultValues: type === "form" ? { foo: value } : undefined,
        defaultValue: type === "controlled" ? value : undefined,
        children: ({ fieldProps }: API) => <input {...fieldProps} />,
      });
      expect(console.warn).not.toHaveBeenCalled();
    }
  );

  it("should return values correctly", () => {
    const { fieldProps, meta } = renderHelper({ anyProp: () => null });
    expect(fieldProps).toEqual({
      name: expect.any(String),
      value: expect.anything(),
      onChange: expect.any(Function),
      onBlur: expect.any(Function),
      anyProp: expect.any(Function),
    });
    expect(meta).toEqual({
      isTouched: expect.any(Boolean),
      isDirty: expect.any(Boolean),
    });
  });

  it("should call events correctly", () => {
    const onChange = jest.fn();
    const onBlur = jest.fn();
    renderHelper({
      onChange,
      onBlur,
      children: ({ fieldProps }: API) => (
        <input data-testid="foo" {...fieldProps} />
      ),
    });
    fireEvent.input(getByTestId("foo"), { target: { value } });
    expect(onChange).toHaveBeenCalled();
    fireEvent.focusOut(getByTestId("foo"));
    expect(onBlur).toHaveBeenCalled();
  });

  it.each(["form", "controlled"])(
    "should set default value from %s option",
    async (type) => {
      const format = jest.fn(() => value);
      renderHelper({
        defaultValues: type === "form" ? { foo: value } : undefined,
        defaultValue: type === "controlled" ? value : undefined,
        format,
        onSubmit,
        children: ({ fieldProps }: API) => (
          <input data-testid="foo" {...fieldProps} />
        ),
      });
      expect(format).toHaveBeenCalledWith(value);
      expect(getByTestId("foo").value).toBe(value);
      fireEvent.submit(getByTestId("form"));
      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith({ foo: value })
      );
    }
  );

  it("should not set default value", () => {
    const { getState } = renderHelper({
      children: ({ fieldProps }: API) => <input {...fieldProps} />,
    });
    expect(getState("values.foo")).toBeUndefined();
  });

  it("should set default value for field-array", () => {
    const { getState } = renderHelper({
      isFieldArray: true,
      defaultValue: value,
      children: ({ fieldProps }: API) => (
        <input data-testid="foo" {...fieldProps} />
      ),
    });
    expect(getState("values.foo")).toBe(value);
  });

  it("should not set default value for field-array", () => {
    const { getState } = renderHelper({
      isFieldArray: true,
      children: ({ fieldProps }: API) => (
        <input data-testid="foo" {...fieldProps} />
      ),
    });
    expect(getState("values.foo")).toBeUndefined();
  });

  it.each(["form", "controlled"])(
    "should reset value from %s option",
    (type) => {
      const onReset = jest.fn();
      const defaultValues = { foo: value };
      const { reset } = renderHelper({
        defaultValues: type === "form" ? defaultValues : undefined,
        defaultValue: type === "controlled" ? defaultValues.foo : undefined,
        onReset,
        children: ({ fieldProps }: API) => (
          <input data-testid="foo" {...fieldProps} />
        ),
      });
      act(() => reset());
      expect(onReset).toHaveBeenCalledWith(defaultValues);
    }
  );

  it("should run validation on submit", async () => {
    const errors = { foo: "Required" };
    const { getState } = renderHelper({
      defaultValue: "",
      validate: async (val: string) => (!val.length ? errors.foo : false),
      onSubmit,
      onError,
      children: ({ fieldProps }: API) => (
        <input data-testid="foo" {...fieldProps} />
      ),
    });

    fireEvent.submit(getByTestId("form"));
    expect(getState("isValidating")).toBeTruthy();
    await waitFor(() => expect(onError).toHaveBeenCalledWith(errors));
    const error = await screen.findByText(errors.foo);
    expect(error).toBeDefined();
    expect(getState("isValidating")).toBeFalsy();
    expect(getState("isValid")).toBeFalsy();

    fireEvent.input(getByTestId("foo"), { target: { value } });
    fireEvent.submit(getByTestId("form"));
    expect(getState("isValidating")).toBeTruthy();
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ foo: value });
      expect(onError).toHaveBeenCalledTimes(1);
    });
    const notError = await screen.findByText("not-error");
    expect(notError).toBeDefined();
    expect(getState("errors")).toEqual({});
    expect(getState("isValidating")).toBeFalsy();
    expect(getState("isValid")).toBeTruthy();
  });

  it("should run validation on change", async () => {
    const error = "Too short";
    const { getState } = renderHelper({
      defaultValue: "",
      validate: (val: string) => (val.length < 5 ? error : false),
      children: ({ fieldProps }: API) => (
        <input data-testid="foo" {...fieldProps} />
      ),
    });

    fireEvent.input(getByTestId("foo"), { target: { value: "123" } });
    await waitFor(() => expect(getState("errors")).toEqual({ foo: error }));
  });

  it("should run validation on blur", async () => {
    const error = "Required";
    const { getState } = renderHelper({
      defaultValue: "",
      validate: (val: string) => (!val.length ? error : false),
      children: ({ fieldProps }: API) => (
        <input data-testid="foo" {...fieldProps} />
      ),
    });

    fireEvent.focusOut(getByTestId("foo"));
    await waitFor(() => expect(getState("errors")).toEqual({ foo: error }));
  });

  it('should ignore "field" method', async () => {
    const mockDate = "2050-01-09";
    renderHelper({
      defaultValue: mockDate,
      type: "date",
      onSubmit,
      onError,
      children: ({ fieldProps, field }: API) => (
        <input
          data-testid="foo"
          {...fieldProps}
          ref={field({ validate: () => "Required", valueAsNumber: true })}
        />
      ),
    });
    fireEvent.submit(getByTestId("form"));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ foo: mockDate });
      expect(onError).not.toHaveBeenCalled();
    });
  });

  it("should handle text correctly", async () => {
    renderHelper({
      name: "text",
      defaultValue: "",
      onSubmit,
      children: ({ fieldProps }: API) => (
        <input data-testid="text" {...fieldProps} />
      ),
    });
    fireEvent.input(getByTestId("text"), { target: { value } });
    fireEvent.submit(getByTestId("form"));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ text: value }));
  });

  it("should handle checkboxes correctly", async () => {
    renderHelper({
      name: "checkboxes",
      type: "checkbox",
      defaultValue: [],
      onSubmit,
      children: ({ fieldProps }: API) => (
        <>
          <input data-testid="checkboxes-0" {...fieldProps} value="🍎" />
          <input data-testid="checkboxes-1" {...fieldProps} value="🍋" />
        </>
      ),
    });
    const checkboxes0 = getByTestId("checkboxes-0");
    userEvent.click(checkboxes0);
    fireEvent.submit(getByTestId("form"));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ checkboxes: [checkboxes0.value] })
    );
  });

  it("should handle multiple select correctly", async () => {
    renderHelper({
      name: "selects",
      defaultValue: [],
      multiple: true,
      onSubmit,
      children: ({ fieldProps }: API) => (
        <select data-testid="selects" {...fieldProps}>
          <option data-testid="selects-0" value="🍎">
            🍎
          </option>
          <option data-testid="selects-1" value="🍋">
            🍋
          </option>
        </select>
      ),
    });
    const selects0 = getByTestId("selects-0");
    userEvent.selectOptions(getByTestId("selects"), [selects0.value]);
    fireEvent.submit(getByTestId("form"));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ selects: [selects0.value] })
    );
  });

  it("should handle custom field correctly", async () => {
    renderHelper({
      defaultValue: 0,
      onSubmit,
      children: ({ fieldProps }: API) => <CustomField {...fieldProps} />,
    });
    fireEvent.click(getByTestId("foo"), { target: { value } });
    fireEvent.submit(getByTestId("form"));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ foo: value }));
  });

  it("should parse value correctly", async () => {
    renderHelper({
      defaultValue: "",
      parse: ({ target }: any) => `${target.value}🍋`,
      onSubmit,
      children: ({ fieldProps }: API) => (
        <input data-testid="foo" {...fieldProps} />
      ),
    });
    fireEvent.input(getByTestId("foo"), { target: { value } });
    fireEvent.submit(getByTestId("form"));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ foo: "🍎🍋" }));
  });

  it("should format value correctly", () => {
    renderHelper({
      defaultValue: "🍎🍋",
      format: (val: string) => val.replace("🍋", ""),
      onSubmit,
      children: ({ fieldProps }: API) => (
        <input data-testid="foo" {...fieldProps} />
      ),
    });
    expect(getByTestId("foo").value).toBe(value);
  });
});
