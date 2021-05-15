/* eslint-disable react/no-unused-prop-types */

import { Dispatch, useState } from "react";
import {
  render,
  fireEvent,
  waitFor,
  screen,
  act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { FormConfig, FormMethods, SubmitHandler, ErrorHandler } from "./types";
import { set, remove } from "./shared";
import { isFunction } from "./utils";
import useForm from "./useForm";

jest.mock("./shared", () => ({ set: jest.fn(), remove: jest.fn() }));

type Children = JSX.Element | JSX.Element[] | null;

type API = Omit<FormMethods, "form"> & {
  show: boolean;
  setShow: Dispatch<boolean>;
};

interface Config extends FormConfig {
  children: Children | ((api: API) => Children);
  isShow: boolean;
  onSubmit: (values: any) => void;
  onSubmitFull: SubmitHandler;
  onError: (errors: any) => void;
  onErrorFull: ErrorHandler;
  onRender: () => void;
}

type Props = Partial<Config>;

const Form = ({
  children,
  isShow,
  onSubmit = () => null,
  onSubmitFull,
  onError = () => null,
  onErrorFull,
  onRender = () => null,
  ...config
}: Props) => {
  const [show, setShow] = useState(!!isShow);
  const methods = useForm({
    ...config,
    onSubmit: (...args) =>
      onSubmitFull ? onSubmitFull(...args) : onSubmit(args[0]),
    onError: (...args) =>
      onErrorFull ? onErrorFull(...args) : onError(args[0]),
  });

  onRender();

  return (
    <form data-testid="form" ref={methods.form}>
      {isFunction(children)
        ? children({ ...methods, show, setShow })
        : children}
    </form>
  );
};

const renderHelper = ({ children = null, ...rest }: Props = {}) => {
  let api: API;

  const { unmount } = render(
    <Form {...rest}>
      {(a) => {
        api = a;
        return isFunction(children) ? children(a) : children;
      }}
    </Form>
  );

  // @ts-expect-error
  return { unmount, ...api };
};

describe("useForm", () => {
  console.warn = jest.fn();
  const onSubmit = jest.fn();
  const onError = jest.fn();
  const onReset = jest.fn();
  const onRender = jest.fn();
  const builtInError = "Constraints not satisfied";
  const initialState = {
    values: {},
    touched: {},
    errors: {},
    isDirty: false,
    dirty: {},
    isValidating: false,
    isValid: true,
    isSubmitting: false,
    isSubmitted: false,
    submitCount: 0,
  };
  const options = {
    focus: expect.any(Function),
    removeField: expect.any(Function),
    getState: expect.any(Function),
    setValue: expect.any(Function),
    setTouched: expect.any(Function),
    setDirty: expect.any(Function),
    setError: expect.any(Function),
    clearErrors: expect.any(Function),
    runValidation: expect.any(Function),
    reset: expect.any(Function),
    submit: expect.any(Function),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // @ts-expect-error
    global.__DEV__ = true;
  });

  describe("warning", () => {
    it("should warn for a missing name field", () => {
      renderHelper({ children: <input /> });
      expect(console.warn).toHaveBeenCalledWith(
        '💡 react-cool-form > field: Missing "name" attribute. Do you want to exclude the field? See: https://react-cool-form.netlify.app/docs/api-reference/use-form/#excludefields'
      );
    });

    it("should not warn for a missing name field", () => {
      renderHelper({ children: <input name="foo" /> });
      expect(console.warn).not.toHaveBeenCalled();
    });

    it("should not warn for a missing name field when it's excluded", () => {
      renderHelper({ children: <input data-testid="foo" data-rcf-exclude /> });
      expect(console.warn).not.toHaveBeenCalled();

      fireEvent.input(screen.getByTestId("foo"), { target: { value: "🍎" } });
      expect(console.warn).not.toHaveBeenCalled();
    });

    it('should warn watch "values" alone', () => {
      const { use } = renderHelper();
      use("values");
      use("values");
      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.warn).toHaveBeenCalledWith(
        '💡 react-cool-form > use: Getting "values" alone might cause unnecessary re-renders. If you know what you\'re doing, just ignore this warning. See: https://react-cool-form.netlify.app/docs/getting-started/form-state#best-practices'
      );
    });

    it('should not warn watch "values" alone', () => {
      const { use } = renderHelper();
      use("foo");
      expect(console.warn).not.toHaveBeenCalled();
    });

    it("should warn form-level validation exception", async () => {
      renderHelper({
        validate: () => {
          // eslint-disable-next-line no-throw-literal
          throw "🍎";
        },
        children: <input data-testid="foo" name="foo" />,
      });
      fireEvent.input(screen.getByTestId("foo"));
      await waitFor(() =>
        expect(console.warn).toHaveBeenCalledWith(
          "💡 react-cool-form > validate form: ",
          "🍎"
        )
      );
    });

    it("should warn field-level validation exception", async () => {
      const id = "foo";
      renderHelper({
        children: ({ field }: API) => (
          <input
            data-testid={id}
            name="foo"
            ref={field(() => {
              // eslint-disable-next-line no-throw-literal
              throw "🍎";
            })}
          />
        ),
      });
      fireEvent.input(screen.getByTestId(id));
      await waitFor(() =>
        expect(console.warn).toHaveBeenCalledWith(
          `💡 react-cool-form > validate ${id}: `,
          "🍎"
        )
      );
    });

    it("should not warn in production", () => {
      // @ts-expect-error
      global.__DEV__ = false;
      renderHelper({ children: <input /> });
      expect(console.warn).not.toHaveBeenCalled();
    });
  });

  it("should return methods correctly", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { unmount, show, setShow, ...methods } = renderHelper();
    expect(methods).toEqual({
      form: expect.any(Function),
      field: expect.any(Function),
      use: expect.any(Function),
      focus: expect.any(Function),
      removeField: expect.any(Function),
      getState: expect.any(Function),
      setValue: expect.any(Function),
      setTouched: expect.any(Function),
      setDirty: expect.any(Function),
      setError: expect.any(Function),
      clearErrors: expect.any(Function),
      runValidation: expect.any(Function),
      reset: expect.any(Function),
      submit: expect.any(Function),
    });
  });

  it("should handle global methods correctly", () => {
    const { unmount } = renderHelper();
    expect(set).toHaveBeenCalled();
    unmount();
    expect(remove).toHaveBeenCalled();
  });

  describe("event callbacks", () => {
    it('should call "onSubmit" event correctly', async () => {
      const { getState } = renderHelper({
        onSubmitFull: onSubmit,
        onError,
        children: (
          <>
            <input data-testid="foo" name="foo" />
            <input data-testid="bar" name="bar" />
          </>
        ),
      });

      const value = "🍎";
      fireEvent.input(screen.getByTestId("foo"), { target: { value } });
      fireEvent.submit(screen.getByTestId("form"));
      const state = {
        ...initialState,
        values: { foo: value, bar: "" },
        touched: { foo: true, bar: true },
        dirty: { foo: true },
        isDirty: true,
        isValidating: true,
        isSubmitting: true,
        submitCount: 1,
      };
      expect(getState()).toEqual(state);
      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith(
          state.values,
          options,
          expect.any(Object)
        )
      );
      expect(onError).not.toHaveBeenCalled();
      expect(getState()).toEqual({
        ...state,
        isValidating: false,
        isSubmitting: false,
        isSubmitted: true,
      });

      fireEvent.submit(screen.getByTestId("form"));
      expect(getState("isSubmitted")).toBeFalsy();
      await waitFor(() => expect(onSubmit).toHaveBeenCalled());
      expect(getState("isSubmitted")).toBeTruthy();
    });

    it('should call "onError" event correctly', async () => {
      const { getState } = renderHelper({
        onErrorFull: onError,
        onSubmit,
        children: <input data-testid="foo" name="foo" required />,
      });
      fireEvent.submit(screen.getByTestId("form"));
      const errors = { foo: builtInError };
      await waitFor(() =>
        expect(onError).toHaveBeenCalledWith(
          errors,
          options,
          expect.any(Object)
        )
      );
      expect(onSubmit).not.toHaveBeenCalled();
      expect(getState()).toEqual({
        ...initialState,
        values: { foo: "" },
        errors,
        touched: { foo: true },
        isValid: false,
        submitCount: 1,
      });
    });

    it('should call "onReset" event correctly', () => {
      const defaultValues = { foo: "" };
      const { getState } = renderHelper({
        defaultValues,
        onReset,
        children: <input data-testid="foo" name="foo" />,
      });
      const value = "🍎";
      const foo = screen.getByTestId("foo") as HTMLInputElement;
      fireEvent.input(foo, { target: { value } });
      expect(foo.value).toBe(value);
      fireEvent.reset(screen.getByTestId("form"));
      expect(foo.value).toBe(defaultValues.foo);
      expect(onReset).toHaveBeenCalledWith(
        defaultValues,
        options,
        expect.any(Object)
      );
      expect(getState()).toEqual({ ...initialState, values: defaultValues });
    });
  });

  describe("submit", () => {
    it("should submit form with success mode", async () => {
      const { submit, getState } = renderHelper({
        onSubmitFull: onSubmit,
        children: (
          <>
            <input data-testid="foo" name="foo" />
            <input data-testid="bar" name="bar" />
          </>
        ),
      });
      const value = "🍎";
      const e = {};
      fireEvent.input(screen.getByTestId("foo"), { target: { value } });
      // @ts-expect-error
      const result = await submit(e);
      const values = { foo: value, bar: "" };
      expect(result).toEqual({ values });
      expect(onSubmit).toHaveBeenCalledWith(values, options, e);
      expect(getState()).toEqual({
        ...initialState,
        values,
        touched: { foo: true, bar: true },
        dirty: { foo: true },
        isDirty: true,
        isSubmitted: true,
        submitCount: 1,
      });
    });

    it("should submit form with fail mode", async () => {
      const { submit, getState } = renderHelper({
        onErrorFull: onError,
        children: <input data-testid="foo" name="foo" required />,
      });
      const e = {};
      // @ts-expect-error
      const result = await submit(e);
      const errors = { foo: builtInError };
      expect(result).toEqual({ errors });
      expect(onError).toHaveBeenCalledWith(errors, options, e);
      expect(getState()).toEqual({
        ...initialState,
        values: { foo: "" },
        errors,
        touched: { foo: true },
        isValid: false,
        submitCount: 1,
      });
    });
  });

  it("should reset form correctly", () => {
    const defaultValues = { foo: "" };
    const { reset, setValue, setError, getState } = renderHelper({
      defaultValues,
      onReset,
      children: <input data-testid="foo" name="foo" />,
    });
    const value = "🍎";
    const foo = screen.getByTestId("foo") as HTMLInputElement;

    setValue("foo", value);
    setError("foo", "Required");
    const e = {};
    // @ts-expect-error
    act(() => reset(null, null, e));
    expect(foo.value).toBe(defaultValues.foo);
    expect(onReset).toHaveBeenCalledWith(defaultValues, options, e);
    expect(getState()).toEqual({ ...initialState, values: defaultValues });

    const values = { foo: value };
    // @ts-expect-error
    act(() => reset(values, null, e));
    expect(foo.value).toBe(values.foo);
    expect(onReset).toHaveBeenCalledWith(values, options, e);
    expect(getState()).toEqual({ ...initialState, values });

    // @ts-expect-error
    act(() => reset((prevValues) => ({ ...prevValues, ...values }), null, e));
    expect(foo.value).toBe(value);
    expect(onReset).toHaveBeenCalledWith(values, options, e);
    expect(getState()).toEqual({ ...initialState, values });

    const error = "Required";
    setValue("foo", value);
    setError("foo", error);
    // @ts-expect-error
    act(() => reset(null, ["values", "errors", "touched"], e));
    expect(foo.value).toBe(value);
    expect(onReset).toHaveBeenCalledWith(values, options, e);
    expect(getState()).toEqual({
      ...initialState,
      values,
      errors: { foo: error },
      touched: { foo: true },
    });
  });

  describe("default values", () => {
    const defaultValues = {
      text: "🍎",
      number: 1,
      range: 10,
      checkbox: true,
      checkboxes: ["🍎"],
      radio: "🍎",
      textarea: "🍎",
      select: "🍎",
      selects: ["🍎", "🍋"],
    };
    const defaultNestedValue = { text: { a: [{ b: "🍎" }] } };
    const getChildren = () => (
      <>
        <input data-testid="text" name="text" />
        <input data-testid="number" name="number" type="number" />
        <input data-testid="range" name="range" type="range" />
        <input data-testid="checkbox" name="checkbox" type="checkbox" />
        <input
          data-testid="checkboxes-0"
          name="checkboxes"
          type="checkbox"
          value="🍎"
        />
        <input
          data-testid="checkboxes-1"
          name="checkboxes"
          type="checkbox"
          value="🍋"
        />
        <input data-testid="radio-0" name="radio" type="radio" value="🍎" />
        <input data-testid="radio-1" name="radio" type="radio" value="🍋" />
        <textarea data-testid="textarea" name="textarea" />
        <select name="select">
          <option data-testid="select-0" value="🍎">
            🍎
          </option>
          <option data-testid="select-1" value="🍋">
            🍋
          </option>
        </select>
        <select name="selects" multiple>
          <option data-testid="selects-0" value="🍎">
            🍎
          </option>
          <option data-testid="selects-1" value="🍋">
            🍋
          </option>
        </select>
      </>
    );

    it("should get empty values", async () => {
      renderHelper({ onSubmit });
      fireEvent.submit(screen.getByTestId("form"));
      await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({}));
    });

    it("should set values correctly via value attribute", async () => {
      renderHelper({ onSubmit, children: getChildren() });
      const values: any = {
        text: "",
        number: "",
        range: 50,
        checkbox: false,
        checkboxes: [],
        radio: "",
        textarea: "",
        select: "🍎",
        selects: [],
      };
      const {
        text,
        number,
        range,
        checkbox,
        checkboxes,
        radio,
        textarea,
        select,
        selects,
      } = values;

      expect((screen.getByTestId("text") as HTMLInputElement).value).toBe(text);
      expect((screen.getByTestId("number") as HTMLInputElement).value).toBe(
        number.toString()
      );
      expect((screen.getByTestId("range") as HTMLInputElement).value).toBe(
        range.toString()
      );
      // eslint-disable-next-line jest-dom/prefer-checked
      expect((screen.getByTestId("checkbox") as HTMLInputElement).checked).toBe(
        checkbox
      );
      const checkboxes0 = screen.getByTestId(
        "checkboxes-0"
      ) as HTMLInputElement;
      expect(checkboxes0.checked).toBe(checkboxes.includes(checkboxes0.value));
      const checkboxes1 = screen.getByTestId(
        "checkboxes-1"
      ) as HTMLInputElement;
      expect(checkboxes1.checked).toBe(checkboxes.includes(checkboxes1.value));
      expect((screen.getByTestId("textarea") as HTMLInputElement).value).toBe(
        textarea
      );
      const radio0 = screen.getByTestId("radio-0") as HTMLInputElement;
      expect(radio0.checked).toBe(radio0.value === radio);
      const radio1 = screen.getByTestId("radio-0") as HTMLInputElement;
      expect(radio1.checked).toBe(radio1.value === radio);
      const select0 = screen.getByTestId("select-0") as HTMLOptionElement;
      expect(select0.selected).toBe(select0.value === select);
      const select1 = screen.getByTestId("select-1") as HTMLOptionElement;
      expect(select1.selected).toBe(select1.value === select);
      const selects0 = screen.getByTestId("selects-0") as HTMLOptionElement;
      expect(selects0.selected).toBe(selects.includes(selects0.value));
      const selects1 = screen.getByTestId("selects-1") as HTMLOptionElement;
      expect(selects1.selected).toBe(selects.includes(selects1.value));

      fireEvent.submit(screen.getByTestId("form"));
      await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(values));
    });

    it("should set values correctly via defaultValues option", async () => {
      renderHelper({
        defaultValues,
        onSubmit,
        children: getChildren(),
      });
      const {
        text,
        number,
        range,
        checkbox,
        checkboxes,
        radio,
        textarea,
        select,
        selects,
      } = defaultValues;

      expect((screen.getByTestId("text") as HTMLInputElement).value).toBe(text);
      expect((screen.getByTestId("number") as HTMLInputElement).value).toBe(
        number.toString()
      );
      expect((screen.getByTestId("range") as HTMLInputElement).value).toBe(
        range.toString()
      );
      // eslint-disable-next-line jest-dom/prefer-checked
      expect((screen.getByTestId("checkbox") as HTMLInputElement).checked).toBe(
        checkbox
      );
      const checkboxes0 = screen.getByTestId(
        "checkboxes-0"
      ) as HTMLInputElement;
      expect(checkboxes0.checked).toBe(checkboxes.includes(checkboxes0.value));
      const checkboxes1 = screen.getByTestId(
        "checkboxes-1"
      ) as HTMLInputElement;
      expect(checkboxes1.checked).toBe(checkboxes.includes(checkboxes1.value));
      const radio0 = screen.getByTestId("radio-0") as HTMLInputElement;
      expect(radio0.checked).toBe(radio0.value === radio);
      const radio1 = screen.getByTestId("radio-0") as HTMLInputElement;
      expect(radio1.checked).toBe(radio1.value === radio);
      expect((screen.getByTestId("textarea") as HTMLInputElement).value).toBe(
        textarea
      );
      const select0 = screen.getByTestId("select-0") as HTMLOptionElement;
      expect(select0.selected).toBe(select0.value === select);
      const select1 = screen.getByTestId("select-1") as HTMLOptionElement;
      expect(select1.selected).toBe(select1.value === select);
      const selects0 = screen.getByTestId("selects-0") as HTMLOptionElement;
      expect(selects0.selected).toBe(selects.includes(selects0.value));
      const selects1 = screen.getByTestId("selects-1") as HTMLOptionElement;
      expect(selects1.selected).toBe(selects.includes(selects1.value));

      fireEvent.submit(screen.getByTestId("form"));
      await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(defaultValues));
    });

    it("should set nested values correctly via defaultValues option", async () => {
      renderHelper({
        defaultValues: defaultNestedValue,
        onSubmit,
        children: <input data-testid="text" name="text.a[0].b" />,
      });

      expect((screen.getByTestId("text") as HTMLInputElement).value).toBe(
        defaultNestedValue.text.a[0].b
      );

      fireEvent.submit(screen.getByTestId("form"));
      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith(defaultNestedValue)
      );
    });

    it("should set values correctly via defaultValue attribute", async () => {
      renderHelper({
        onSubmit,
        children: (
          <>
            <input name="text" defaultValue={defaultValues.text} />
            <input
              name="number"
              type="number"
              defaultValue={defaultValues.number}
            />
            <input
              name="range"
              type="range"
              defaultValue={defaultValues.range}
            />
            <input name="checkbox" type="checkbox" defaultChecked />
            <input
              name="checkboxes"
              type="checkbox"
              value="🍎"
              defaultChecked
            />
            <input name="checkboxes" type="checkbox" value="🍋" />
            <input name="radio" type="radio" value="🍎" defaultChecked />
            <input name="radio" type="radio" value="🍋" />
            <textarea name="textarea" defaultValue={defaultValues.textarea} />
            <select name="select" defaultValue={defaultValues.select}>
              <option value="🍎">🍎</option>
              <option value="🍋">🍋</option>
            </select>
            <select
              name="selects"
              multiple
              defaultValue={defaultValues.selects}
            >
              <option value="🍎">🍎</option>
              <option value="🍋">🍋</option>
            </select>
          </>
        ),
      });
      fireEvent.submit(screen.getByTestId("form"));
      await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(defaultValues));
    });

    it("should set nested values correctly via defaultValue attribute", async () => {
      renderHelper({
        onSubmit,
        children: (
          <input
            name="text.a[0].b"
            defaultValue={defaultNestedValue.text.a[0].b}
          />
        ),
      });
      fireEvent.submit(screen.getByTestId("form"));
      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith(defaultNestedValue)
      );
    });

    it("should use form-level default value first", async () => {
      const value = "🍎";
      renderHelper({
        defaultValues: { foo: value },
        onSubmit,
        children: <input data-testid="foo" name="foo" defaultValue="🍋" />,
      });
      expect((screen.getByTestId("foo") as HTMLInputElement).value).toBe(value);
      fireEvent.submit(screen.getByTestId("form"));
      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith({ foo: value })
      );
    });
  });

  describe("handle change", () => {
    it.each(["text", "number", "range"])(
      "should handle %s correctly",
      async (type) => {
        const defaultValues: any = {
          text: "",
          number: "",
          range: 50,
        };
        const { getState } = renderHelper({
          defaultValues: { foo: defaultValues[type] },
          onSubmit,
          children: <input data-testid="foo" name="foo" type={type} />,
        });
        const values: any = {
          text: "🍎",
          number: 100,
          range: 100,
        };
        fireEvent.input(screen.getByTestId("foo"), {
          target: { value: values[type] },
        });
        fireEvent.submit(screen.getByTestId("form"));
        await waitFor(() =>
          expect(onSubmit).toHaveBeenCalledWith({ foo: values[type] })
        );
        expect(getState("touched.foo")).toBeTruthy();
        expect(getState("dirty.foo")).toBeTruthy();
        expect(getState("isDirty")).toBeTruthy();

        fireEvent.input(screen.getByTestId("foo"), {
          target: { value: defaultValues[type] },
        });
        fireEvent.submit(screen.getByTestId("form"));
        await waitFor(() =>
          expect(onSubmit).toHaveBeenCalledWith({ foo: defaultValues[type] })
        );
        expect(getState("dirty.foo")).toBeUndefined();
        expect(getState("isDirty")).toBeFalsy();
      }
    );

    it("should handle checkbox with boolean correctly", async () => {
      const { getState } = renderHelper({
        defaultValues: { foo: false },
        onSubmit,
        children: <input data-testid="foo" name="foo" type="checkbox" />,
      });
      const foo = screen.getByTestId("foo") as HTMLInputElement;
      const form = screen.getByTestId("form");

      userEvent.click(foo);
      fireEvent.submit(form);
      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith({ foo: foo.checked })
      );
      expect(getState("touched.foo")).toBeTruthy();
      expect(getState("dirty.foo")).toBeTruthy();
      expect(getState("isDirty")).toBeTruthy();

      userEvent.click(foo);
      fireEvent.submit(form);
      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith({ foo: foo.checked })
      );
      expect(getState("dirty.foo")).toBeUndefined();
      expect(getState("isDirty")).toBeFalsy();
    });

    it.each(["valid", "invalid"])(
      "should handle checkbox with array correctly",
      async (type) => {
        const value = "🍎";
        renderHelper({
          onSubmit,
          children: (
            <input
              data-testid="foo"
              name="foo"
              type="checkbox"
              defaultValue={type === "valid" ? value : undefined}
            />
          ),
        });
        const foo = screen.getByTestId("foo") as HTMLInputElement;
        const form = screen.getByTestId("form");

        userEvent.click(foo);
        fireEvent.submit(form);
        await waitFor(() =>
          expect(onSubmit).toHaveBeenCalledWith({
            foo: type === "valid" ? [value] : foo.checked,
          })
        );

        userEvent.click(foo);
        fireEvent.submit(form);
        await waitFor(() =>
          expect(onSubmit).toHaveBeenCalledWith({
            foo: type === "valid" ? [] : foo.checked,
          })
        );
      }
    );

    it("should handle checkboxes correctly", async () => {
      const { getState } = renderHelper({
        defaultValues: { foo: [] },
        onSubmit,
        children: (
          <>
            <input data-testid="foo-0" name="foo" type="checkbox" value="🍎" />
            <input data-testid="foo-1" name="foo" type="checkbox" value="🍋" />
          </>
        ),
      });
      const form = screen.getByTestId("form");
      const foo0 = screen.getByTestId("foo-0") as HTMLInputElement;
      const foo1 = screen.getByTestId("foo-1") as HTMLInputElement;

      userEvent.click(foo0);
      fireEvent.submit(form);
      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith({ foo: [foo0.value] })
      );
      expect(getState("touched.foo")).toBeTruthy();
      expect(getState("dirty.foo")).toBeTruthy();
      expect(getState("isDirty")).toBeTruthy();

      userEvent.click(foo1);
      fireEvent.submit(form);
      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith({ foo: [foo0.value, foo1.value] })
      );

      userEvent.click(foo0);
      fireEvent.submit(form);
      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith({ foo: [foo1.value] })
      );

      userEvent.click(foo1);
      fireEvent.submit(form);
      await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ foo: [] }));
      expect(getState("dirty.foo")).toBeUndefined();
      expect(getState("isDirty")).toBeFalsy();
    });

    it("should handle radio buttons correctly", async () => {
      renderHelper({
        defaultValues: { foo: "" },
        onSubmit,
        children: (
          <>
            <input data-testid="foo-0" name="foo" type="radio" value="🍎" />
            <input data-testid="foo-1" name="foo" type="radio" value="🍋" />
          </>
        ),
      });
      const form = screen.getByTestId("form");
      const foo0 = screen.getByTestId("foo-0") as HTMLInputElement;
      const foo1 = screen.getByTestId("foo-1") as HTMLInputElement;

      userEvent.click(foo0);
      fireEvent.submit(form);
      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith({ foo: foo0.value })
      );

      userEvent.click(foo1);
      fireEvent.submit(form);
      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith({ foo: foo1.value })
      );
    });

    it("should handle textarea correctly", async () => {
      renderHelper({
        defaultValues: { foo: "" },
        onSubmit,
        children: <textarea data-testid="foo" name="foo" />,
      });
      const value = "🍎";
      fireEvent.input(screen.getByTestId("foo"), {
        target: { value },
      });
      fireEvent.submit(screen.getByTestId("form"));
      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith({ foo: value })
      );
    });

    it("should handle select correctly", async () => {
      renderHelper({
        defaultValues: { foo: "🍎" },
        onSubmit,
        children: (
          <>
            <select data-testid="foo" name="foo">
              <option data-testid="foo-0" value="🍎">
                🍎
              </option>
              <option data-testid="foo-1" value="🍋">
                🍋
              </option>
            </select>
          </>
        ),
      });
      const form = screen.getByTestId("form");
      const foo = screen.getByTestId("foo");
      const foo0 = screen.getByTestId("foo-0") as HTMLOptionElement;
      const foo1 = screen.getByTestId("foo-1") as HTMLOptionElement;

      userEvent.selectOptions(foo, [foo1.value]);
      fireEvent.submit(form);
      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith({ foo: foo1.value })
      );

      userEvent.selectOptions(foo, [foo0.value]);
      fireEvent.submit(form);
      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith({ foo: foo0.value })
      );
    });

    it("should handle multiple select correctly", async () => {
      renderHelper({
        defaultValues: { foo: [] },
        onSubmit,
        children: (
          <>
            <select data-testid="foo" name="foo" multiple>
              <option data-testid="foo-0" value="🍎">
                🍎
              </option>
              <option data-testid="foo-1" value="🍋">
                🍋
              </option>
            </select>
          </>
        ),
      });
      const form = screen.getByTestId("form");
      const foo = screen.getByTestId("foo");
      const foo0 = screen.getByTestId("foo-0") as HTMLOptionElement;
      const foo1 = screen.getByTestId("foo-1") as HTMLOptionElement;

      let value = [foo0.value];
      userEvent.selectOptions(foo, value);
      fireEvent.submit(form);
      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith({ foo: value })
      );

      value = [foo0.value, foo1.value];
      userEvent.selectOptions(foo, value);
      fireEvent.submit(form);
      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith({ foo: value })
      );

      userEvent.deselectOptions(foo, foo0.value);
      fireEvent.submit(form);
      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith({ foo: [foo1.value] })
      );

      userEvent.deselectOptions(foo, foo1.value);
      fireEvent.submit(form);
      await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ foo: [] }));
    });

    it("should handle file correctly", async () => {
      renderHelper({
        defaultValues: { foo: null },
        onSubmit,
        children: <input data-testid="foo" name="foo" type="file" />,
      });
      userEvent.upload(
        screen.getByTestId("foo"),
        new File(["🍎"], "🍎.png", { type: "image/png" })
      );
      fireEvent.submit(screen.getByTestId("form"));
      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith({
          foo: {
            "0": expect.any(Object),
            item: expect.any(Function),
            length: 1,
          },
        })
      );
    });

    it("should handle files correctly", async () => {
      renderHelper({
        defaultValues: { foo: null },
        onSubmit,
        children: <input data-testid="foo" name="foo" type="file" multiple />,
      });
      userEvent.upload(screen.getByTestId("foo"), [
        new File(["🍎"], "🍎.png", { type: "image/png" }),
        new File(["🍋"], "🍋.png", { type: "image/png" }),
      ]);
      fireEvent.submit(screen.getByTestId("form"));
      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith({
          foo: {
            "0": expect.any(Object),
            "1": expect.any(Object),
            item: expect.any(Function),
            length: 2,
          },
        })
      );
    });
  });

  describe("validation", () => {
    const value = "🍎";

    it.each(["message", "state"])(
      "should run built-in validation with %s mode",
      async (mode) => {
        const { getState } = renderHelper({
          builtInValidationMode: mode as "message" | "state",
          onSubmit,
          onError,
          children: <input data-testid="foo" name="foo" required />,
        });
        const form = screen.getByTestId("form");
        const foo = screen.getByTestId("foo");

        const errors = {
          foo: mode === "message" ? builtInError : "valueMissing",
        };
        fireEvent.submit(form);
        expect(getState("isValidating")).toBeTruthy();
        await waitFor(() => expect(onError).toHaveBeenCalledWith(errors));
        expect(getState("isValidating")).toBeFalsy();
        expect(getState("isValid")).toBeFalsy();

        onError.mockClear();
        fireEvent.input(foo, { target: { value } });
        fireEvent.submit(form);
        expect(getState("isValidating")).toBeTruthy();
        await waitFor(() => {
          expect(onSubmit).toHaveBeenCalledWith({ foo: value });
          expect(onError).not.toHaveBeenCalled();
        });
        expect(getState("errors")).toEqual({});
        expect(getState("isValidating")).toBeFalsy();
        expect(getState("isValid")).toBeTruthy();
      }
    );

    it("should run built-in validation with nested fields", async () => {
      const errors = { foo: { a: builtInError, b: builtInError } };
      renderHelper({
        onError,
        children: (
          <>
            <input name="foo.a" required />
            <input name="foo.b" required />
          </>
        ),
      });
      fireEvent.submit(screen.getByTestId("form"));
      await waitFor(() => expect(onError).toHaveBeenCalledWith(errors));
    });

    it("should disable built-in validation", async () => {
      const { getState } = renderHelper({
        builtInValidationMode: false,
        onError,
        children: <input data-testid="foo" name="foo" required />,
      });
      fireEvent.submit(screen.getByTestId("form"));
      expect(getState("isValidating")).toBeTruthy();
      await waitFor(() => expect(onError).not.toHaveBeenCalled());
      expect(getState("isValidating")).toBeFalsy();
      expect(getState("isValid")).toBeTruthy();
    });

    it("should run form-level validation", async () => {
      const errors = { foo: "Required" };
      const { getState } = renderHelper({
        validate: async ({ foo }) => (!foo.length ? errors : {}),
        onSubmit,
        onError,
        children: <input data-testid="foo" name="foo" required />,
      });
      const form = screen.getByTestId("form");
      const foo = screen.getByTestId("foo");

      fireEvent.submit(form);
      expect(getState("isValidating")).toBeTruthy();
      await waitFor(() => expect(onError).toHaveBeenCalledWith(errors));
      expect(getState("isValidating")).toBeFalsy();
      expect(getState("isValid")).toBeFalsy();

      onError.mockClear();
      fireEvent.input(foo, { target: { value } });
      fireEvent.submit(form);
      expect(getState("isValidating")).toBeTruthy();
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({ foo: value });
        expect(onError).not.toHaveBeenCalled();
      });
      expect(getState("errors")).toEqual({});
      expect(getState("isValidating")).toBeFalsy();
      expect(getState("isValid")).toBeTruthy();
    });

    it.each(["normal", "shortcut"])(
      "should run field-level validation in %s way",
      async (type) => {
        const errors = { foo: "Required" };
        const validate = async (val: string) =>
          !val.length ? errors.foo : false;
        const { getState } = renderHelper({
          onSubmit,
          onError,
          children: ({ field }: API) => (
            <input
              data-testid="foo"
              name="foo"
              ref={field(type === "normal" ? { validate } : validate)}
            />
          ),
        });
        const form = screen.getByTestId("form");
        const foo = screen.getByTestId("foo");

        fireEvent.submit(form);
        expect(getState("isValidating")).toBeTruthy();
        await waitFor(() => expect(onError).toHaveBeenCalledWith(errors));
        expect(getState("isValidating")).toBeFalsy();
        expect(getState("isValid")).toBeFalsy();

        onError.mockClear();
        fireEvent.input(foo, { target: { value } });
        fireEvent.submit(form);
        expect(getState("isValidating")).toBeTruthy();
        await waitFor(() => {
          expect(onSubmit).toHaveBeenCalledWith({ foo: value });
          expect(onError).not.toHaveBeenCalled();
        });
        expect(getState("errors")).toEqual({});
        expect(getState("isValidating")).toBeFalsy();
        expect(getState("isValid")).toBeTruthy();
      }
    );

    it("should run field-level validation with nested fields", async () => {
      const errors = { foo: { a: "Required", b: "Required" } };
      renderHelper({
        onError,
        children: ({ field }: API) => (
          <>
            <input
              name="foo.a"
              ref={field((val: string) => (!val.length ? errors.foo.a : false))}
            />
            <input
              name="foo.b"
              ref={field((val: string) => (!val.length ? errors.foo.b : false))}
            />
          </>
        ),
      });
      fireEvent.submit(screen.getByTestId("form"));
      await waitFor(() => expect(onError).toHaveBeenCalledWith(errors));
    });

    it("should run field-level validation with dependent fields", async () => {
      const errors = { foo: "Bar is required" };
      renderHelper({
        onSubmit,
        onError,
        children: ({ field }: API) => (
          <>
            <input
              name="foo"
              ref={field((_, values) =>
                !values.bar.length ? errors.foo : false
              )}
            />
            <input data-testid="bar" name="bar" />
          </>
        ),
      });
      const form = screen.getByTestId("form");

      fireEvent.submit(form);
      await waitFor(() => expect(onError).toHaveBeenCalledWith(errors));

      onError.mockClear();
      fireEvent.input(screen.getByTestId("bar"), { target: { value } });
      fireEvent.submit(form);
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({ foo: "", bar: value });
        expect(onError).not.toHaveBeenCalled();
      });
    });

    it.each(["run", "disable"])(
      "should %s validation on change",
      async (type) => {
        const { getState, setValue } = renderHelper({
          validateOnChange: type === "run",
          children: <input data-testid="foo" name="foo" required />,
        });
        const error = type === "run" ? { foo: builtInError } : {};

        fireEvent.input(screen.getByTestId("foo"), { target: { value: "" } });
        await waitFor(() => expect(getState("errors")).toEqual(error));

        setValue("foo", "");
        await waitFor(() => expect(getState("errors")).toEqual(error));
      }
    );

    it.each(["run", "disable"])(
      "should %s validation on blur",
      async (type) => {
        const { getState, setTouched } = renderHelper({
          validateOnChange: false,
          validateOnBlur: type === "run",
          children: <input data-testid="foo" name="foo" required />,
        });
        const error = type === "run" ? { foo: builtInError } : {};

        fireEvent.focusOut(screen.getByTestId("foo"));
        await waitFor(() => expect(getState("errors")).toEqual(error));

        setTouched("foo");
        await waitFor(() => expect(getState("errors")).toEqual(error));
      }
    );

    it("should avoid repeatedly validation", async () => {
      const validate = jest.fn();
      renderHelper({
        validate,
        children: <input data-testid="foo" name="foo" />,
      });
      const foo = screen.getByTestId("foo");

      fireEvent.focusOut(foo);
      await waitFor(() => expect(validate).toHaveBeenCalled());

      validate.mockClear();
      fireEvent.input(foo);
      await waitFor(() => expect(validate).toHaveBeenCalled());
      fireEvent.focusOut(foo);
      await waitFor(() => expect(validate).toHaveBeenCalledTimes(1));
    });

    it("should merge form-level error correctly", async () => {
      const error = "Field required";
      const { getState } = renderHelper({
        onSubmit,
        onError,
        children: ({ field }: API) => (
          <input
            data-testid="foo"
            name="foo"
            ref={field(() => error)}
            required
          />
        ),
      });
      fireEvent.input(screen.getByTestId("foo"));
      await waitFor(() => expect(getState("errors.foo")).toBe(error));
    });

    it("should merge field-level error correctly", async () => {
      const error = "Form required";
      const { getState } = renderHelper({
        validate: async () => ({ foo: error }),
        onSubmit,
        onError,
        children: ({ field }: API) => (
          <input
            data-testid="foo"
            name="foo"
            ref={field(() => "Field required")}
            required
          />
        ),
      });
      fireEvent.input(screen.getByTestId("foo"));
      await waitFor(() => expect(getState("errors.foo")).toBe(error));
    });
  });

  describe("exclude fields", () => {
    const defaultValues = { foo: "🍋" };
    const e = { target: { value: "🍎" } };

    it("should exclude a field via excludeFields option", async () => {
      renderHelper({
        defaultValues,
        excludeFields: ["foo", "#bar", ".baz"],
        onSubmit,
        children: (
          <>
            <input data-testid="foo" name="foo" />
            <input data-testid="bar" name="bar" id="bar" />
            <input data-testid="baz" name="baz" className="baz" />
          </>
        ),
      });
      const foo = screen.getByTestId("foo") as HTMLInputElement;
      const bar = screen.getByTestId("bar") as HTMLInputElement;
      const baz = screen.getByTestId("baz") as HTMLInputElement;
      expect(foo.value).toBe("");
      expect(bar.value).toBe("");
      expect(baz.value).toBe("");
      fireEvent.input(foo, e);
      fireEvent.input(bar, e);
      fireEvent.input(baz, e);
      fireEvent.submit(screen.getByTestId("form"));
      await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(defaultValues));
    });

    it("should exclude a field via data attribute", async () => {
      renderHelper({
        defaultValues,
        onSubmit,
        children: <input data-testid="foo" name="foo" data-rcf-exclude />,
      });
      const foo = screen.getByTestId("foo") as HTMLInputElement;
      expect(foo.value).toBe("");
      fireEvent.input(foo, e);
      fireEvent.submit(screen.getByTestId("form"));
      await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(defaultValues));
    });

    it('should ignore "field" method', async () => {
      const mockDate = "2050-01-09";
      renderHelper({
        defaultValues: { foo: mockDate },
        excludeFields: ["foo"],
        onSubmit,
        children: ({ field }: API) => (
          <input
            name="foo"
            type="date"
            ref={field({
              validate: () => "Required",
              valueAsNumber: true,
            })}
          />
        ),
      });
      fireEvent.submit(screen.getByTestId("form"));
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({ foo: mockDate });
        expect(onError).not.toHaveBeenCalled();
      });
    });
  });

  describe("runValidation", () => {
    it("should run built-in validation correctly", async () => {
      const { runValidation, getState } = renderHelper({
        children: (
          <>
            <input name="foo" required />
            <input name="bar" required />
            <input name="baz" required />
          </>
        ),
      });

      runValidation("foo");
      await waitFor(() =>
        expect(getState("errors")).toEqual({
          foo: builtInError,
        })
      );

      runValidation(["foo", "bar"]);
      await waitFor(() =>
        expect(getState("errors")).toEqual({
          foo: builtInError,
          bar: builtInError,
        })
      );

      runValidation();
      await waitFor(() =>
        expect(getState("errors")).toEqual({
          foo: builtInError,
          bar: builtInError,
          baz: builtInError,
        })
      );
    });

    it("should run field-level validation correctly", async () => {
      const error = "Required";
      const validate = async (value: string) =>
        !value.length ? "Required" : false;
      const { runValidation, getState } = renderHelper({
        children: ({ field }: API) => (
          <>
            <input name="foo" ref={field(validate)} />
            <input name="bar" ref={field(validate)} />
            <input name="baz" ref={field(validate)} />
          </>
        ),
      });

      runValidation("foo");
      await waitFor(() =>
        expect(getState("errors")).toEqual({
          foo: error,
        })
      );

      runValidation(["foo", "bar"]);
      await waitFor(() =>
        expect(getState("errors")).toEqual({
          foo: error,
          bar: error,
        })
      );

      runValidation();
      await waitFor(() =>
        expect(getState("errors")).toEqual({
          foo: error,
          bar: error,
          baz: error,
        })
      );
    });

    it("should run form-level validation correctly", async () => {
      const error = "Required";
      const { runValidation, getState } = renderHelper({
        validate: async ({ foo, bar, baz }) => {
          const errors: { foo?: string; bar?: string; baz?: string } = {};
          if (!foo.length) errors.foo = error;
          if (!bar.length) errors.bar = error;
          if (!baz.length) errors.baz = error;
          return errors;
        },
        children: (
          <>
            <input name="foo" />
            <input name="bar" />
            <input name="baz" />
          </>
        ),
      });

      runValidation("foo");
      await waitFor(() =>
        expect(getState("errors")).toEqual({
          foo: error,
        })
      );

      runValidation(["foo", "bar"]);
      await waitFor(() =>
        expect(getState("errors")).toEqual({
          foo: error,
          bar: error,
        })
      );

      runValidation();
      await waitFor(() =>
        expect(getState("errors")).toEqual({
          foo: error,
          bar: error,
          baz: error,
        })
      );
    });

    it("should return correctly", async () => {
      let { runValidation } = renderHelper({
        children: <input name="foo" />,
      });
      let isValid = await runValidation();
      expect(isValid).toBeTruthy();
      isValid = await runValidation("foo");
      expect(isValid).toBeTruthy();
      isValid = await runValidation(["foo"]);
      expect(isValid).toBeTruthy();

      runValidation = renderHelper({
        children: <input name="foo" required />,
      }).runValidation;
      isValid = await runValidation();
      expect(isValid).toBeFalsy();
      isValid = await runValidation("foo");
      expect(isValid).toBeFalsy();
      isValid = await runValidation(["foo"]);
      expect(isValid).toBeFalsy();
    });
  });

  describe("focus", () => {
    it("should focus on error", async () => {
      renderHelper({
        validate: ({ foo, bar }) => {
          const errors: any = {};
          if (!foo.length) errors.foo = "Required";
          if (!bar.length) errors.bar = "Required";
          return errors;
        },
        onError,
        children: (
          <>
            <input data-testid="foo" name="foo" />
            <input data-testid="bar" name="bar" />
          </>
        ),
      });
      fireEvent.submit(screen.getByTestId("form"));
      await waitFor(() => expect(onError).toHaveBeenCalled());
      expect(screen.getByTestId("foo")).toHaveFocus();

      fireEvent.input(screen.getByTestId("foo"), { target: { value: "🍎" } });
      fireEvent.submit(screen.getByTestId("form"));
      await waitFor(() => expect(onError).toHaveBeenCalled());
      expect(screen.getByTestId("bar")).toHaveFocus();
    });

    it("should disable focus on error", async () => {
      renderHelper({
        focusOnError: false,
        validate: ({ foo }) => (!foo.length ? { foo: "Required" } : {}),
        onError,
        children: <input data-testid="foo" name="foo" />,
      });
      fireEvent.submit(screen.getByTestId("form"));
      await waitFor(() => expect(onError).toHaveBeenCalled());
      expect(screen.getByTestId("foo")).not.toHaveFocus();
    });

    it.each([
      ["bar", "foo"],
      // eslint-disable-next-line no-return-assign
      (names: string[]) => ([names[0], names[1]] = [names[1], names[0]]),
    ])("should focus on error by custom order", async (focusOnError) => {
      renderHelper({
        focusOnError,
        validate: ({ foo, bar }) => {
          const errors: any = {};
          if (!foo.length) errors.foo = "Required";
          if (!bar.length) errors.bar = "Required";
          return errors;
        },
        onError,
        children: (
          <>
            <input data-testid="foo" name="foo" />
            <input data-testid="bar" name="bar" />
          </>
        ),
      });
      fireEvent.submit(screen.getByTestId("form"));
      await waitFor(() => expect(onError).toHaveBeenCalled());
      expect(screen.getByTestId("bar")).toHaveFocus();
    });

    it("should focus correctly", () => {
      const { focus } = renderHelper({
        children: <input data-testid="foo" name="foo" />,
      });
      focus("foo");
      expect(screen.getByTestId("foo")).toHaveFocus();
    });

    it("should focus on the first field correctly", () => {
      const { focus } = renderHelper({
        children: (
          <>
            <input data-testid="foo.a" name="foo.a" />
            <input data-testid="foo.b" name="foo.b" />
          </>
        ),
      });
      focus("foo");
      expect(screen.getByTestId("foo.a")).toHaveFocus();
    });

    it("should delay to focus", () => {
      jest.useFakeTimers();

      const { focus } = renderHelper({
        children: <input data-testid="foo" name="foo" />,
      });
      const delay = 1000;
      focus("foo", delay);
      expect(screen.getByTestId("foo")).not.toHaveFocus();
      jest.advanceTimersByTime(delay);
      expect(screen.getByTestId("foo")).toHaveFocus();
    });
  });

  describe("use", () => {
    const { values, isValid } = { ...initialState, values: { foo: "🍎" } };

    it('should return undefined if "path" isn\'t set', () => {
      const { use } = renderHelper();
      // @ts-expect-error
      expect(use()).toBeUndefined();
    });

    it("should get default value correctly", () => {
      const formValue = { foo: null };
      const selectValue = { foo: "🍎" };
      let { use } = renderHelper({ defaultValues: formValue });
      expect(use("values.foo")).toBe(formValue.foo);

      expect(use("values.foo", { defaultValues: selectValue })).toBe(
        formValue.foo
      );

      use = renderHelper().use;
      expect(use("values.foo", { defaultValues: selectValue })).toBe(
        selectValue.foo
      );

      expect(use("values.foo")).toBeUndefined();
    });

    it("should get state's values with correct format", () => {
      const { use } = renderHelper({ defaultValues: values });

      expect(use("values")).toEqual(values);
      expect(use("values.foo")).toBe(values.foo);
      expect(use("isValid")).toBe(isValid);

      expect(use(["values", "values.foo", "isValid"])).toEqual([
        values,
        values.foo,
        isValid,
      ]);

      expect(
        use({
          values: "values",
          foo: "values.foo",
          isValid: "isValid",
        })
      ).toEqual({ values, foo: values.foo, isValid });
    });

    it("should get form's values by shortcut", () => {
      const { use } = renderHelper({ defaultValues: values });
      const { foo } = values;
      expect(use("foo")).toBe(foo);
      expect(use(["foo"])).toEqual([foo]);
      expect(use({ foo: "foo" })).toEqual({ foo });
    });

    it("should get error with touched", async () => {
      const { use } = renderHelper({
        children: <input data-testid="foo" name="foo" required />,
      });
      const foo = screen.getByTestId("foo");

      fireEvent.input(foo, { target: { value: "" } });
      await waitFor(() => {
        expect(use("errors.foo")).not.toBeUndefined();
        expect(use("errors.foo", { errorWithTouched: true })).toBeUndefined();
      });

      fireEvent.focusOut(foo);
      await waitFor(() => {
        expect(
          use("errors.foo", { errorWithTouched: true })
        ).not.toBeUndefined();
      });
    });

    it("should trigger re-rendering correctly", () => {
      const { use } = renderHelper({
        onRender,
        children: (
          <>
            <input data-testid="foo" name="foo" />
            <input data-testid="bar" name="bar" />
          </>
        ),
      });

      use("foo");
      fireEvent.input(screen.getByTestId("foo"));
      expect(onRender).toHaveBeenCalledTimes(2);

      use("bar");
      fireEvent.input(screen.getByTestId("bar"));
      expect(onRender).toHaveBeenCalledTimes(3);
    });
  });

  describe("getState", () => {
    const state = { ...initialState, values: { foo: "🍎" } };
    const { values, isValid } = state;

    it("should get state", () => {
      const { getState } = renderHelper({ defaultValues: values });
      expect(getState()).toEqual(state);
    });

    it("should get state's values with correct format", () => {
      const { getState } = renderHelper({ defaultValues: values });

      expect(getState("values")).toEqual(values);
      expect(getState("foo")).toBe(values.foo);
      expect(getState("isValid")).toBe(isValid);

      expect(getState(["values", "values.foo", "isValid"])).toEqual([
        values,
        values.foo,
        isValid,
      ]);

      expect(
        getState({
          values: "values",
          foo: "values.foo",
          isValid: "isValid",
        })
      ).toEqual({ values, foo: values.foo, isValid });
    });

    it("should get delete value correctly", () => {
      const { getState, setValue } = renderHelper({ defaultValues: values });
      act(() => setValue("foo"));
      expect(getState("foo")).toBeUndefined();
    });

    it("should get form's values by shortcut", () => {
      const { getState } = renderHelper({ defaultValues: values });
      const { foo } = values;
      expect(getState("foo")).toBe(foo);
      expect(getState(["foo"])).toEqual([foo]);
      expect(getState({ foo: "foo" })).toEqual({ foo });
    });

    it("should not trigger re-rendering", () => {
      const { getState } = renderHelper({
        onRender,
        children: <input data-testid="foo" name="foo" />,
      });
      getState("foo");
      fireEvent.input(screen.getByTestId("foo"));
      expect(onRender).toHaveBeenCalledTimes(1);
    });
  });

  describe("setValue", () => {
    it("should set value correctly", () => {
      const { setValue, getState } = renderHelper();
      const value = "🍎";

      setValue("foo", value);
      expect(getState("foo")).toBe(value);

      setValue("foo", (prevValue: string) => prevValue);
      expect(getState("foo")).toBe(value);

      setValue("foo.a[0].b", value);
      expect(getState("foo.a[0].b")).toBe(value);

      setValue("foo");
      expect(getState("foo")).toBeUndefined();
    });

    it("should set value with touched correctly", () => {
      const { setValue, getState } = renderHelper();

      setValue("foo", "🍎", { shouldTouched: false });
      expect(getState("touched.foo")).toBeUndefined();

      setValue("foo", "🍎");
      expect(getState("touched.foo")).toBeTruthy();
    });

    it("should set value with dirty correctly", () => {
      const { setValue, getState } = renderHelper();

      setValue("foo", "🍎", { shouldDirty: false });
      expect(getState("dirty.foo")).toBeUndefined();
      expect(getState("isDirty")).toBeFalsy();

      setValue("foo", "🍎");
      expect(getState("dirty.foo")).toBeTruthy();
      expect(getState("isDirty")).toBeTruthy();
    });

    it("should set value with validation correctly", async () => {
      const { setValue, getState } = renderHelper({
        children: <input data-testid="foo" name="foo" required />,
      });

      setValue("foo", "", { shouldValidate: false });
      await waitFor(() => expect(getState("errors.foo")).toBeUndefined());

      setValue("foo", "");
      await waitFor(() => expect(getState("errors.foo")).toBe(builtInError));
    });
  });

  describe("setTouched", () => {
    it("should set touched correctly", () => {
      const { setTouched, getState } = renderHelper();

      setTouched("foo");
      expect(getState("touched.foo")).toBeTruthy();

      setTouched("foo.a[0].b");
      expect(getState("touched.foo.a[0].b")).toBeTruthy();

      setTouched("foo", false);
      expect(getState("touched.foo")).toBeUndefined();
    });

    it("should set touched with validation correctly", async () => {
      const { setTouched, getState } = renderHelper({
        children: <input data-testid="foo" name="foo" required />,
      });

      setTouched("foo", true, false);
      await waitFor(() => expect(getState("errors.foo")).toBeUndefined());

      setTouched("foo");
      await waitFor(() => expect(getState("errors.foo")).toBe(builtInError));
    });
  });

  it("should set dirty correctly", () => {
    const { setDirty, getState } = renderHelper();

    setDirty("foo");
    expect(getState("dirty.foo")).toBeTruthy();

    setDirty("foo.a[0].b");
    expect(getState("dirty.foo.a[0].b")).toBeTruthy();

    setDirty("foo", false);
    expect(getState("dirty.foo")).toBeUndefined();
  });

  it("should set error correctly", () => {
    const { setError, getState } = renderHelper();
    const error = "Required";

    setError("foo", error);
    expect(getState("errors.foo")).toBe(error);

    setError("foo", (prevError: string) => prevError);
    expect(getState("errors.foo")).toBe(error);

    setError("foo.a[0].b", error);
    expect(getState("errors.foo.a[0].b")).toBe(error);

    setError("foo");
    expect(getState("errors.foo")).toBeUndefined();

    setError("foo", error);
    setError("foo", false);
    expect(getState("errors.foo")).toBeUndefined();

    setError("foo", error);
    setError("foo", null);
    expect(getState("errors.foo")).toBeUndefined();

    setError("foo", error);
    setError("foo", "");
    expect(getState("errors.foo")).toBeUndefined();
  });

  it("should clear error(s)", () => {
    const { setError, clearErrors, getState } = renderHelper();
    const error = "Required";

    setError("foo", error);
    setError("bar", error);
    setError("baz.a[0].b", error);
    expect(getState("errors")).toEqual({
      foo: error,
      bar: error,
      baz: { a: [{ b: error }] },
    });

    clearErrors("foo");
    expect(getState("errors.foo")).toBeUndefined();

    clearErrors(["bar", "baz.a[0].b"]);
    expect(getState("errors.bar")).toBeUndefined();
    expect(getState("baz.a[0].b")).toBeUndefined();

    setError("foo", error);
    clearErrors();
    expect(getState("errors")).toEqual({});
  });

  it.each(["number", "date", "custom"])(
    "should convert field value to %s",
    async (type) => {
      const value = {
        number: expect.any(Number),
        date: expect.any(Date),
        custom: "🍎",
      };
      renderHelper({
        onSubmit,
        children: ({ field }: API) => (
          <input
            data-testid="foo"
            name="foo"
            type="date"
            ref={field({
              valueAsNumber: type === "number",
              valueAsDate: type === "date",
              parse: type === "custom" ? () => value[type] : undefined,
            })}
          />
        ),
      });
      fireEvent.input(screen.getByTestId("foo"), {
        target: { value: "1970-01-01" },
      });
      fireEvent.submit(screen.getByTestId("form"));
      await waitFor(() =>
        // @ts-expect-error
        expect(onSubmit).toHaveBeenCalledWith({ foo: value[type] })
      );
    }
  );

  it.each(["normal", "exclude"])("should remove field correctly", (type) => {
    const value = "🍎";
    const { setError, setTouched, setDirty, removeField, reset, getState } =
      renderHelper({
        children: <input data-testid="foo" name="foo" defaultValue="🍎" />,
      });

    act(() => {
      setError("foo", "Required");
      setTouched("foo", true, false);
      setDirty("foo");
      removeField(
        "foo",
        type === "normal"
          ? undefined
          : ["defaultValue", "value", "error", "touched", "dirty"]
      );
    });
    expect(getState()).toEqual(
      type === "normal"
        ? initialState
        : {
            ...initialState,
            values: { foo: value },
            errors: { foo: "Required" },
            isValid: false,
            touched: { foo: true },
            dirty: { foo: true },
            isDirty: true,
          }
    );

    act(() => reset());
    expect(getState("foo")).toEqual(type === "normal" ? undefined : value);

    fireEvent.input(screen.getByTestId("foo"), { target: { value: "🍋" } });
    expect(getState("foo")).toBe(type === "normal" ? undefined : value);
  });

  it('should trigger "onStateChange" correctly', async () => {
    const onStateChange = jest.fn();
    renderHelper({
      onStateChange,
      children: <input data-testid="foo" name="foo" />,
    });
    const value = "🍎";
    fireEvent.input(screen.getByTestId("foo"), { target: { value } });
    await waitFor(() => {
      expect(onStateChange).toHaveBeenCalledTimes(2);
      expect(onStateChange).toHaveBeenNthCalledWith(1, {
        ...initialState,
        values: { foo: value },
      });
      expect(onStateChange).toHaveBeenNthCalledWith(2, {
        ...initialState,
        values: { foo: value },
        dirty: { foo: true },
        isDirty: true,
      });
    });
  });

  describe("conditional fields", () => {
    it.each(["form", "field"])(
      "should set %s-level default value for single field correctly",
      async (type) => {
        const formValue = "🍎";
        const fieldValue = "🍋";
        const { getState, setError, setTouched, setDirty, setShow } =
          renderHelper({
            defaultValues: type === "form" ? { foo: formValue } : undefined,
            children: ({ show }: API) => (
              <>
                {show && (
                  <input
                    data-testid="foo"
                    name="foo"
                    defaultValue={type === "field" ? fieldValue : undefined}
                  />
                )}
              </>
            ),
          });

        act(() => setShow(true));
        await waitFor(() => {
          expect(getState("foo")).toBe(
            type === "form" ? formValue : fieldValue
          );
          expect((screen.getByTestId("foo") as HTMLInputElement).value).toBe(
            type === "form" ? formValue : fieldValue
          );
        });

        act(() => {
          setError("foo", "Required");
          setTouched("foo", true, false);
          setDirty("foo");
          setShow(false);
        });
        await waitFor(() => expect(getState()).toEqual(initialState));

        act(() => setShow(true));
        await waitFor(() => {
          expect(getState()).toEqual({
            ...initialState,
            values: { foo: type === "field" ? fieldValue : undefined },
          });
          expect((screen.getByTestId("foo") as HTMLInputElement).value).toBe(
            type === "field" ? fieldValue : ""
          );
        });
      }
    );

    it.each(["form", "field"])(
      "should set %s-level default value for multiple fields correctly",
      async (type) => {
        const value = ["🍎", "🍋"];
        const { getState, setError, setTouched, setDirty, setShow } =
          renderHelper({
            defaultValues: type === "form" ? { foo: value } : undefined,
            children: ({ show }: API) => (
              <>
                <input
                  data-testid="foo-0"
                  name="foo"
                  type="checkbox"
                  value={value[0]}
                  defaultChecked={type === "field"}
                />
                {show && (
                  <input
                    data-testid="foo-1"
                    name="foo"
                    type="checkbox"
                    value={value[1]}
                    defaultChecked={type === "field"}
                  />
                )}
              </>
            ),
          });

        act(() => setShow(true));
        await waitFor(() => {
          expect(getState("foo")).toEqual(type === "form" ? value : [value[0]]);
          expect(screen.getByTestId("foo-0")).toBeChecked();
          expect(screen.getByTestId("foo-1")).toBeChecked();
        });

        act(() => {
          setError("foo", "Required");
          setTouched("foo", true, false);
          setDirty("foo");
          setShow(false);
        });
        const state = {
          ...initialState,
          values: { foo: [value[0]] },
          errors: { foo: "Required" },
          isValid: false,
          touched: { foo: true },
          dirty: { foo: true },
          isDirty: true,
        };
        await waitFor(() => expect(getState()).toEqual(state));

        act(() => setShow(true));
        await waitFor(() => {
          expect(getState()).toEqual(state);
          expect(screen.getByTestId("foo-0")).toBeChecked();
          expect(screen.getByTestId("foo-1")).toBeChecked();
        });
      }
    );

    it("should remove array fields correctly", async () => {
      const { getState, setShow } = renderHelper({
        defaultValues: { foo: ["🍎", "🍋"] },
        isShow: true,
        children: ({ show }: API) => (
          <>
            {show && <input name="foo[0]" />}
            {show && <input name="foo[1]" />}
          </>
        ),
      });
      act(() => setShow(false));
      await waitFor(() => expect(getState("values")).toEqual({}));
    });

    it.each([false, [], () => []])(
      "should not remove field",
      async (removeOnUnmounted) => {
        const value = "🍎";
        const { getState, setError, setTouched, setDirty, setShow } =
          renderHelper({
            isShow: true,
            removeOnUnmounted,
            children: ({ show }: API) => (
              <>
                {show && (
                  <input data-testid="foo" name="foo" defaultValue={value} />
                )}
              </>
            ),
          });

        act(() => {
          setError("foo", "Required");
          setTouched("foo", true, false);
          setDirty("foo");
          setShow(false);
        });
        await Promise.resolve();
        expect(getState()).toEqual({
          ...initialState,
          values: { foo: value },
          errors: { foo: "Required" },
          isValid: false,
          touched: { foo: true },
          dirty: { foo: true },
          isDirty: true,
        });

        act(() => setShow(true));
        await waitFor(() =>
          expect((screen.getByTestId("foo") as HTMLInputElement).value).toBe(
            value
          )
        );
      }
    );

    it("should trigger re-rendering correctly", async () => {
      const { setValue, setError, setTouched, setDirty, setShow, use } =
        renderHelper({
          isShow: true,
          onRender,
          children: ({ show }: API) => <>{show && <input name="foo" />}</>,
        });
      use(["foo", "errors.foo", "touched.foo", "dirty.foo"]);
      act(() => {
        setValue("foo", "🍎", { shouldValidate: false });
        setError("foo", "Required");
        setTouched("foo", true, false);
        setDirty("foo");
      });
      act(() => setShow(false));
      await waitFor(() => expect(onRender).toHaveBeenCalledTimes(4));
    });
  });
});
