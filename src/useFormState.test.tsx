import { useEffect } from "react";
import { render, fireEvent, screen } from "@testing-library/react";

import { FormStateCallback, FormStateConfig, Path } from "./types";
import useForm from "./useForm";
import useFormState from "./useFormState";

const defaultValues = { foo: "🍎" };
const error = "Required";

interface Props extends FormStateConfig {
  children: (props: any) => JSX.Element;
  path?: Path;
  formDefaultValues?: any;
  errorVal?: string;
  resetVal?: string;
  isTouched?: boolean;
  callback?: FormStateCallback;
  onRender?: () => void;
}

const Form = ({
  children,
  formId,
  path,
  formDefaultValues = defaultValues,
  errorVal,
  resetVal,
  isTouched,
  callback,
  onRender = () => null,
  ...rest
}: Props) => {
  const { form, setError, setTouched, reset } = useForm({
    id: formId,
    defaultValues: formDefaultValues,
  });
  // @ts-expect-error
  const props = useFormState(path, callback || { ...rest, formId }, formId);

  onRender();

  useEffect(() => {
    if (errorVal) setError("foo", errorVal);
    if (resetVal) reset({ foo: resetVal });
    if (isTouched) setTouched("foo");
  }, [errorVal, isTouched, reset, resetVal, setError, setTouched]);

  return <form ref={form}>{children(props)}</form>;
};

const renderHelper = (args: Omit<Props, "children"> = {}) => {
  let props;

  render(
    <Form {...args}>
      {(p) => {
        props = p;
        return <input data-testid="foo" name="foo" />;
      }}
    </Form>
  );

  return props;
};

describe("useFormState", () => {
  it("should throw form id errors", () => {
    expect(() => useFormState("values", { formId: "form-1" })).toThrow(
      '💡 react-cool-form > useFormState: It must work with an "useForm" hook. See: https://react-cool-form.netlify.app/docs/api-reference/use-form'
    );
  });

  it('should warn watch "values" alone', () => {
    console.warn = jest.fn();
    renderHelper({ path: "values" });
    expect(console.warn).toHaveBeenCalledWith(
      '💡 react-cool-form > useFormState: Getting "values" alone might cause unnecessary re-renders. If you know what you\'re doing, just ignore this warning. See: https://react-cool-form.netlify.app/docs/getting-started/form-state#best-practices'
    );
  });

  it.each(["path", "callback"])(
    'should not warn watch "values" alone when %s is set',
    (type) => {
      console.warn = jest.fn();
      renderHelper({
        path: type === "path" ? "values.foo" : "values",
        callback: type === "callback" ? () => null : undefined,
      });
      expect(console.warn).not.toHaveBeenCalled();
    }
  );

  it('should return undefined if "path" isn\'t set', () => {
    const props = renderHelper();
    expect(props).toBeUndefined();
  });

  it('should not trigger callback if "path" isn\'t set', () => {
    const callback = jest.fn();
    renderHelper({ callback });
    fireEvent.input(screen.getByTestId("foo"));
    expect(callback).not.toHaveBeenCalled();
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
  });

  it("should get reset value correctly", () => {
    const resetVal = "🍎";
    expect(renderHelper({ path: "values.foo", resetVal })).toBe(resetVal);
  });

  it("should get state with correct format", () => {
    expect(renderHelper({ path: "values" })).toEqual(defaultValues);
    expect(renderHelper({ path: "values.foo" })).toBe(defaultValues.foo);
    expect(renderHelper({ path: "isValid" })).toBeTruthy();

    expect(renderHelper({ path: ["values", "values.foo", "isValid"] })).toEqual(
      [defaultValues, defaultValues.foo, true]
    );

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

  it("should get form's values by shortcut", () => {
    const { foo } = defaultValues;
    expect(renderHelper({ path: "foo" })).toBe(foo);
    expect(renderHelper({ path: ["foo"] })).toEqual([foo]);
    expect(renderHelper({ path: { foo: "foo" } })).toEqual({ foo });
  });

  it("should get error with touched", () => {
    const args = { path: "errors.foo", errorVal: error };

    expect(renderHelper(args)).not.toBeUndefined();

    expect(renderHelper({ ...args, errorWithTouched: true })).toBeUndefined();

    expect(
      renderHelper({ ...args, errorWithTouched: true, isTouched: true })
    ).toBe(error);
  });

  it("should work with form ID", () => {
    const config = { path: "foo", formId: "form-1" };
    const { foo } = defaultValues;
    expect(renderHelper(config)).toBe(foo);
    expect(renderHelper({ ...config, callback: () => null })).toBe(foo);
  });

  it("should trigger re-rendering", () => {
    const onRender = jest.fn();
    renderHelper({ path: "values.foo", onRender });
    fireEvent.input(screen.getByTestId("foo"), { target: { value: "🍋" } });
    expect(onRender).toHaveBeenCalledTimes(2);
  });

  it("should trigger callback correctly", () => {
    const onRender = jest.fn();
    const callback = jest.fn();
    const value = "🍋";
    renderHelper({ path: "values.foo", onRender, callback });
    fireEvent.input(screen.getByTestId("foo"), { target: { value } });
    expect(callback).toHaveBeenCalledWith(value);
    expect(onRender).toHaveBeenCalledTimes(1);
  });
});
