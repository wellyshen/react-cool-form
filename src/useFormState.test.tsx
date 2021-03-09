import { useEffect } from "react";
import { render, fireEvent, screen } from "@testing-library/react";

import { FormStateConfig, Path } from "./types";
import useForm from "./useForm";
import useFormState from "./useFormState";

const defaultValues = { foo: "🍎" };
const error = "Required";

interface Props extends FormStateConfig {
  children: (state: any) => JSX.Element;
  path?: Path;
  formDefaultValues?: any;
  isError?: boolean;
  isTouched?: boolean;
  onRender?: () => void;
}

const Form = ({
  children,
  path,
  formDefaultValues = defaultValues,
  isError,
  isTouched,
  onRender = () => null,
  ...rest
}: Props) => {
  const { form, setError, setTouched } = useForm({
    defaultValues: formDefaultValues,
  });
  // @ts-expect-error
  const state = useFormState(path, rest);

  onRender();

  useEffect(() => {
    if (isError) setError("foo", error);
    if (isTouched) setTouched("foo");
  }, [isError, isTouched, setError, setTouched]);

  return <form ref={form}>{children(state)}</form>;
};

const renderHelper = (args: Omit<Props, "children"> = {}) => {
  let state;

  render(
    <Form {...args}>
      {(s) => {
        state = s;
        return <input data-testid="foo" name="foo" />;
      }}
    </Form>
  );

  return state;
};

describe("useFormState", () => {
  it("should throw form id errors", () => {
    expect(() => useFormState("values", { formId: "form-1" })).toThrow(
      '💡 react-cool-form > useFormState: You must provide the corresponding ID to the "useForm" hook. See: https://react-cool-form.netlify.app/docs/api-reference/use-form#id'
    );
  });

  it('should warn select "values" alone', () => {
    console.warn = jest.fn();
    renderHelper({ path: "values" });
    expect(console.warn).toHaveBeenCalledWith(
      '💡 react-cool-form > useFormState: Getting the "values" alone might cause unnecessary re-renders. If you know what you\'re doing, please ignore this warning. See: https://react-cool-form.netlify.app/docs/getting-started/form-state#best-practices'
    );
  });

  it('should not warn select "values" alone', () => {
    console.warn = jest.fn();
    renderHelper({ path: "values.foo" });
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('should return undefined if "path" isn\'t set', () => {
    const state = renderHelper();
    expect(state).toBeUndefined();
  });

  it("should get default value correctly", () => {
    const formDefaultValues = { foo: null };
    expect(renderHelper({ path: "values.foo", formDefaultValues })).toBe(
      formDefaultValues.foo
    );

    expect(
      renderHelper({
        path: "values.foo",
        formDefaultValues,
        defaultValues,
      })
    ).toBe(formDefaultValues.foo);

    expect(renderHelper({ path: "values.foo", defaultValues })).toBe(
      defaultValues.foo
    );

    expect(
      renderHelper({ path: "values.foo", formDefaultValues: null })
    ).toBeUndefined();
  });

  it("should get state with correct format", () => {
    expect(renderHelper({ path: "values" })).toEqual(defaultValues);
    expect(renderHelper({ path: "values.foo" })).toBe(defaultValues.foo);
    expect(renderHelper({ path: "isValid" })).toBeTruthy();

    expect(
      renderHelper({ path: ["values", "values.foo", "isValid"] })
    ).toEqual([defaultValues, defaultValues.foo, true]);

    expect(
      renderHelper({
        path: {
          values: "values",
          foo: "values.foo",
          isValid: "isValid",
        },
      })
    ).toEqual({
      values: defaultValues,
      foo: defaultValues.foo,
      isValid: true,
    });
  });

  it("should get state with specific target", () => {
    const target = "values";
    const { foo } = defaultValues;
    expect(renderHelper({ path: "foo", target })).toBe(foo);
    expect(renderHelper({ path: ["foo"], target })).toEqual([foo]);
    expect(renderHelper({ path: { foo: "foo" }, target })).toEqual({ foo });
  });

  it("should get error with touched", () => {
    const path = "errors.foo";
    const args = { path, isError: true };

    expect(renderHelper(args)).not.toBeUndefined();

    expect(renderHelper({ ...args, errorWithTouched: true })).toBeUndefined();

    expect(
      renderHelper({ ...args, errorWithTouched: true, isTouched: true })
    ).toBe(error);
  });

  it("should trigger re-rendering", () => {
    const onRender = jest.fn();
    renderHelper({ path: "values.foo", onRender });
    fireEvent.input(screen.getByTestId("foo"), { target: { value: "🍋" } });
    expect(onRender).toHaveBeenCalledTimes(2);
  });
});
