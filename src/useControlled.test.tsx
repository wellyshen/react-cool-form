import { render, fireEvent, waitFor, screen } from "@testing-library/react";

import { ControlledConfig, FieldProps, GetState, Meta } from "./types";
import useForm from "./useForm";
import useControlled from "./useControlled";

interface API {
  fieldProps: FieldProps<any[]>;
  meta: Meta;
  getState: GetState;
}

interface Config extends Omit<ControlledConfig<any>, "name | formId"> {
  children: (api: API) => JSX.Element | null;
  name: string;
  defaultValues: Record<string, any>;
  onSubmit: (values: any) => void;
  onError: (errors: any) => void;
}

type Props = Partial<Config>;

const Form = ({
  children,
  name = "foo",
  defaultValues,
  onSubmit = () => null,
  onError = () => null,
  ...rest
}: Props) => {
  const { form, getState } = useForm({
    id: "form-1",
    defaultValues,
    onSubmit: (values) => onSubmit(values),
    onError: (errors) => onError(errors),
  });
  const [fieldProps, meta] = useControlled(name, { formId: "form-1", ...rest });

  return (
    <>
      <div>{meta.error ? meta.error : "not-error"}</div>
      <div>{meta.isTouched ? "touched" : "not-touched"}</div>
      <div>{meta.isDirty ? "dirty" : "not-dirty"}</div>
      <form data-testid="form" ref={form}>
        {children ? children({ fieldProps, meta, getState }) : null}
      </form>
    </>
  );
};

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

  it("should warn missing default value", () => {
    console.warn = jest.fn();
    renderHelper({
      children: ({ fieldProps }: API) => (
        <input data-testid="foo" {...fieldProps} />
      ),
    });
    fireEvent.input(getByTestId("foo"), { target: { value } });
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith(
      '💡 react-cool-form > useControlled: Please provide a default value for the "foo" field.'
    );
  });

  it.each(["form", "controlled"])(
    "should not warn missing default value",
    (type) => {
      console.warn = jest.fn();
      renderHelper({
        defaultValues: type === "form" ? { foo: value } : undefined,
        defaultValue: type === "controlled" ? value : undefined,
        children: ({ fieldProps }: API) => <input {...fieldProps} />,
      });
      expect(console.warn).not.toHaveBeenCalled();
    }
  );

  it("should not set default value automatically", () => {
    console.warn = jest.fn();
    const { getState } = renderHelper({
      children: ({ fieldProps }: API) => <input {...fieldProps} />,
    });
    expect(getState("values.foo")).toBeUndefined();
  });

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

  it("should run validation", async () => {
    const onError = jest.fn();
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
    const form = getByTestId("form");

    fireEvent.submit(form);
    expect(getState("isValidating")).toBeTruthy();
    await waitFor(() => expect(onError).toHaveBeenCalledWith(errors));
    const error = await screen.findByText(errors.foo);
    expect(error).toBeDefined();
    expect(getState("isValidating")).toBeFalsy();
    expect(getState("isValid")).toBeFalsy();

    fireEvent.input(getByTestId("foo"), { target: { value } });
    fireEvent.submit(form);
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
  }); */
});
