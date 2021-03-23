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

type Methods = Omit<FormMethods, "form">;

interface Config extends FormConfig {
  children: Children | ((methods: Methods) => Children);
  onSubmit: (values: any) => void;
  onSubmitFull: SubmitHandler;
  onError: (errors: any) => void;
  onErrorFull: ErrorHandler;
  onRender: () => void;
}

type Props = Partial<Config>;

const Form = ({
  children,
  onSubmit = () => null,
  onSubmitFull,
  onError = () => null,
  onErrorFull,
  onRender = () => null,
  ...config
}: Props) => {
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
      {isFunction(children) ? children(methods) : children}
    </form>
  );
};

const renderHelper = ({ children = null, ...rest }: Props = {}) => {
  let methods: Methods;

  const { unmount } = render(
    <Form {...rest}>
      {(m) => {
        methods = m;
        return isFunction(children) ? children(m) : children;
      }}
    </Form>
  );

  // @ts-expect-error
  return { unmount, ...methods };
};

describe("useForm", () => {
  console.warn = jest.fn();
  const getByTestId = screen.getByTestId as any;
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
      renderHelper({ children: <input data-testid="foo" /> });
      fireEvent.input(getByTestId("foo"));
      expect(console.warn).toHaveBeenCalledTimes(2);
      expect(console.warn).toHaveBeenNthCalledWith(
        1,
        '💡 react-cool-form > field: Missing "name" attribute. Do you want to exclude the field? See: https://react-cool-form.netlify.app/docs/api-reference/use-form/#excludefields'
      );
      expect(console.warn).toHaveBeenNthCalledWith(
        2,
        '💡 react-cool-form > field: Missing "name" attribute.'
      );
    });

    it("should not warn for a missing name field", () => {
      renderHelper({ children: <input data-testid="foo" name="foo" /> });
      expect(console.warn).not.toHaveBeenCalled();
    });

    it("should not warn for a missing name field when it's excluded", () => {
      renderHelper({ children: <input data-rcf-exclude /> });
      expect(console.warn).not.toHaveBeenCalled();
    });

    it('should warn mon "values" alone', () => {
      const { mon } = renderHelper();
      mon("values");
      mon("values");
      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.warn).toHaveBeenCalledWith(
        '💡 react-cool-form > mon: Getting "values" alone might cause unnecessary re-renders. If you know what you\'re doing, please ignore this warning. See: https://react-cool-form.netlify.app/docs/getting-started/form-state#best-practices'
      );
    });

    it('should not warn mon "values" alone', () => {
      const { mon } = renderHelper();
      mon("values.foo");
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
      fireEvent.input(getByTestId("foo"));
      await waitFor(() =>
        expect(console.warn).toHaveBeenCalledWith(
          "💡 react-cool-form > validate form: ",
          "🍎"
        )
      );
    });

    it("should not warn form-level validation exception", async () => {
      renderHelper({
        validate: () => false,
        children: <input data-testid="foo" name="foo" />,
      });
      fireEvent.input(getByTestId("foo"));
      await waitFor(() => expect(console.warn).not.toHaveBeenCalled());
    });

    it("should warn field-level validation exception", async () => {
      const id = "foo";
      renderHelper({
        children: ({ field }: Methods) => (
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
      fireEvent.input(getByTestId(id));
      await waitFor(() =>
        expect(console.warn).toHaveBeenCalledWith(
          `💡 react-cool-form > validate ${id}: `,
          "🍎"
        )
      );
    });

    it("should not warn field-level validation exception", async () => {
      const id = "foo";
      renderHelper({
        children: ({ field }: Methods) => (
          <input data-testid={id} name="foo" ref={field(() => false)} />
        ),
      });
      fireEvent.input(getByTestId(id));
      await waitFor(() => expect(console.warn).not.toHaveBeenCalled());
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
    const { unmount, ...methods } = renderHelper();
    expect(methods).toEqual({
      form: expect.any(Function),
      field: expect.any(Function),
      mon: expect.any(Function),
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
      fireEvent.input(getByTestId("foo"), { target: { value } });
      fireEvent.submit(getByTestId("form"));
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
    });

    it('should call "onError" event correctly', async () => {
      const { getState } = renderHelper({
        onErrorFull: onError,
        onSubmit,
        children: <input data-testid="foo" name="foo" required />,
      });
      fireEvent.submit(getByTestId("form"));
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
      const foo = getByTestId("foo") as HTMLInputElement;
      fireEvent.input(foo, { target: { value } });
      expect(foo.value).toBe(value);
      fireEvent.reset(getByTestId("form"));
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
      fireEvent.input(getByTestId("foo"), { target: { value } });
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
    const foo = getByTestId("foo");

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

      expect(getByTestId("text").value).toBe(text);
      expect(getByTestId("number").value).toBe(number.toString());
      expect(getByTestId("range").value).toBe(range.toString());
      expect(getByTestId("checkbox").checked).toBe(checkbox);
      const checkboxes0 = getByTestId("checkboxes-0");
      expect(checkboxes0.checked).toBe(checkboxes.includes(checkboxes0.value));
      const checkboxes1 = getByTestId("checkboxes-1");
      expect(checkboxes1.checked).toBe(checkboxes.includes(checkboxes1.value));
      expect(getByTestId("textarea").value).toBe(textarea);
      const radio0 = getByTestId("radio-0");
      expect(radio0.checked).toBe(radio0.value === radio);
      const radio1 = getByTestId("radio-0");
      expect(radio1.checked).toBe(radio1.value === radio);
      const select0 = getByTestId("select-0");
      expect(select0.selected).toBe(select0.value === select);
      const select1 = getByTestId("select-1");
      expect(select1.selected).toBe(select1.value === select);
      const selects0 = getByTestId("selects-0");
      expect(selects0.selected).toBe(selects.includes(selects0.value));
      const selects1 = getByTestId("selects-1");
      expect(selects1.selected).toBe(selects.includes(selects1.value));

      fireEvent.submit(getByTestId("form"));
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

      expect(getByTestId("text").value).toBe(text);
      expect(getByTestId("number").value).toBe(number.toString());
      expect(getByTestId("range").value).toBe(range.toString());
      expect(getByTestId("checkbox").checked).toBe(checkbox);
      const checkboxes0 = getByTestId("checkboxes-0");
      expect(checkboxes0.checked).toBe(checkboxes.includes(checkboxes0.value));
      const checkboxes1 = getByTestId("checkboxes-1");
      expect(checkboxes1.checked).toBe(checkboxes.includes(checkboxes1.value));
      const radio0 = getByTestId("radio-0");
      expect(radio0.checked).toBe(radio0.value === radio);
      const radio1 = getByTestId("radio-0");
      expect(radio1.checked).toBe(radio1.value === radio);
      expect(getByTestId("textarea").value).toBe(textarea);
      const select0 = getByTestId("select-0");
      expect(select0.selected).toBe(select0.value === select);
      const select1 = getByTestId("select-1");
      expect(select1.selected).toBe(select1.value === select);
      const selects0 = getByTestId("selects-0");
      expect(selects0.selected).toBe(selects.includes(selects0.value));
      const selects1 = getByTestId("selects-1");
      expect(selects1.selected).toBe(selects.includes(selects1.value));

      fireEvent.submit(getByTestId("form"));
      await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(defaultValues));
    });

    it("should set nested values correctly via defaultValues option", async () => {
      renderHelper({
        defaultValues: defaultNestedValue,
        onSubmit,
        children: <input data-testid="text" name="text.a[0].b" />,
      });

      expect(getByTestId("text").value).toBe(defaultNestedValue.text.a[0].b);

      fireEvent.submit(getByTestId("form"));
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
      fireEvent.submit(getByTestId("form"));
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
      fireEvent.submit(getByTestId("form"));
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
      expect(getByTestId("foo").value).toBe(value);
      fireEvent.submit(getByTestId("form"));
      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith({ foo: value })
      );
    });
  });

  describe("handle change", () => {
    it.each(["text", "number", "range"])(
      "should handle %s correctly",
      async (type) => {
        renderHelper({
          defaultValues: { foo: "" },
          onSubmit,
          children: <input data-testid="foo" name="foo" type={type} />,
        });
        const values: any = {
          text: "🍎",
          number: 100,
          range: 100,
        };
        fireEvent.input(getByTestId("foo"), {
          target: { value: values[type] },
        });
        fireEvent.submit(getByTestId("form"));
        await waitFor(() =>
          expect(onSubmit).toHaveBeenCalledWith({ foo: values[type] })
        );
      }
    );

    it("should handle checkbox with boolean correctly", async () => {
      const { getState } = renderHelper({
        defaultValues: { foo: false },
        onSubmit,
        children: <input data-testid="foo" name="foo" type="checkbox" />,
      });
      const foo = getByTestId("foo");
      const form = getByTestId("form");

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
        const foo = getByTestId("foo");
        const form = getByTestId("form");

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
      const form = getByTestId("form");
      const foo0 = getByTestId("foo-0") as HTMLInputElement;
      const foo1 = getByTestId("foo-1") as HTMLInputElement;

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
      const form = getByTestId("form");
      const foo0 = getByTestId("foo-0") as HTMLInputElement;
      const foo1 = getByTestId("foo-1") as HTMLInputElement;

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
      fireEvent.input(getByTestId("foo"), {
        target: { value },
      });
      fireEvent.submit(getByTestId("form"));
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
      const form = getByTestId("form");
      const foo = getByTestId("foo");
      const foo0 = getByTestId("foo-0") as HTMLOptionElement;
      const foo1 = getByTestId("foo-1") as HTMLOptionElement;

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
      const form = getByTestId("form");
      const foo = getByTestId("foo");
      const foo0 = getByTestId("foo-0") as HTMLOptionElement;
      const foo1 = getByTestId("foo-1") as HTMLOptionElement;

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
        getByTestId("foo"),
        new File(["🍎"], "🍎.png", { type: "image/png" })
      );
      fireEvent.submit(getByTestId("form"));
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
      userEvent.upload(getByTestId("foo"), [
        new File(["🍎"], "🍎.png", { type: "image/png" }),
        new File(["🍋"], "🍋.png", { type: "image/png" }),
      ]);
      fireEvent.submit(getByTestId("form"));
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
        const form = getByTestId("form");
        const foo = getByTestId("foo");

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

    it("should disable built-in validation", async () => {
      const { getState } = renderHelper({
        builtInValidationMode: false,
        onError,
        children: <input data-testid="foo" name="foo" required />,
      });
      fireEvent.submit(getByTestId("form"));
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
      const form = getByTestId("form");
      const foo = getByTestId("foo");

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
      "should run field-level validation via %s way",
      async (type) => {
        const errors = { foo: "Required" };
        const validate = async (val: string) =>
          !val.length ? errors.foo : false;
        const { getState } = renderHelper({
          onSubmit,
          onError,
          children: ({ field }: Methods) => (
            <input
              data-testid="foo"
              name="foo"
              ref={field(type === "normal" ? { validate } : validate)}
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

    it("should run field-level validation with dependent fields", async () => {
      const errors = { foo: "Bar is required" };
      renderHelper({
        onSubmit,
        onError,
        children: ({ field }: Methods) => (
          <>
            <input
              data-testid="foo"
              name="foo"
              ref={field((_, values) =>
                !values.bar.length ? errors.foo : false
              )}
            />
            <input data-testid="bar" name="bar" />
          </>
        ),
      });
      const form = getByTestId("form");

      fireEvent.submit(form);
      await waitFor(() => expect(onError).toHaveBeenCalledWith(errors));

      onError.mockClear();
      fireEvent.input(getByTestId("bar"), { target: { value } });
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

        fireEvent.input(getByTestId("foo"), { target: { value: "" } });
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

        fireEvent.focusOut(getByTestId("foo"));
        await waitFor(() => expect(getState("errors")).toEqual(error));

        setTouched("foo");
        await waitFor(() => expect(getState("errors")).toEqual(error));
      }
    );

    it("should avoid repeatedly validation", async () => {
      const { getState, clearErrors } = renderHelper({
        children: <input data-testid="foo" name="foo" required />,
      });
      const foo = getByTestId("foo");

      fireEvent.focusOut(getByTestId("foo"));
      await waitFor(() =>
        expect(getState("errors")).toEqual({ foo: builtInError })
      );

      fireEvent.input(foo, { target: { value: "" } });
      await waitFor(() =>
        expect(getState("errors")).toEqual({ foo: builtInError })
      );
      act(() => clearErrors("foo"));
      fireEvent.focusOut(foo);
      await waitFor(() => expect(getState("errors")).toEqual({}));
    });

    it("should merge form-level error correctly", async () => {
      const error = "Field required";
      const { getState } = renderHelper({
        onSubmit,
        onError,
        children: ({ field }: Methods) => (
          <input
            data-testid="foo"
            name="foo"
            ref={field(() => error)}
            required
          />
        ),
      });
      fireEvent.input(getByTestId("foo"));
      await waitFor(() => expect(getState("errors.foo")).toBe(error));
    });

    it("should merge field-level error correctly", async () => {
      const error = "Form required";
      const { getState } = renderHelper({
        validate: async () => ({ foo: error }),
        onSubmit,
        onError,
        children: ({ field }: Methods) => (
          <input
            data-testid="foo"
            name="foo"
            ref={field(() => "Field required")}
            required
          />
        ),
      });
      fireEvent.input(getByTestId("foo"));
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
      const foo = getByTestId("foo") as HTMLInputElement;
      const bar = getByTestId("bar") as HTMLInputElement;
      const baz = getByTestId("baz") as HTMLInputElement;
      expect(foo.value).toBe("");
      expect(bar.value).toBe("");
      expect(baz.value).toBe("");
      fireEvent.input(foo, e);
      fireEvent.input(bar, e);
      fireEvent.input(baz, e);
      fireEvent.submit(getByTestId("form"));
      await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(defaultValues));
    });

    it("should exclude a field via data attribute", async () => {
      renderHelper({
        defaultValues,
        onSubmit,
        children: <input data-testid="foo" name="foo" data-rcf-exclude />,
      });
      const foo = getByTestId("foo") as HTMLInputElement;
      expect(foo.value).toBe("");
      fireEvent.input(foo, e);
      fireEvent.submit(getByTestId("form"));
      await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(defaultValues));
    });

    it('should ignore "field" method', async () => {
      const mockDate = "2050-01-09";
      renderHelper({
        defaultValues: { foo: mockDate },
        excludeFields: ["foo"],
        onSubmit,
        children: ({ field }: Methods) => (
          <input
            data-testid="foo"
            name="foo"
            type="date"
            ref={field({
              validate: () => "Required",
              valueAsNumber: true,
            })}
          />
        ),
      });
      fireEvent.submit(getByTestId("form"));
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
            <input data-testid="foo" name="foo" required />
            <input data-testid="bar" name="bar" required />
            <input data-testid="baz" name="baz" required />
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
      const validate = (value: string) => (!value.length ? "Required" : false);
      const { runValidation, getState } = renderHelper({
        children: ({ field }: Methods) => (
          <>
            <input data-testid="foo" name="foo" ref={field(validate)} />
            <input data-testid="bar" name="bar" ref={field(validate)} />
            <input data-testid="baz" name="baz" ref={field(validate)} />
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
        validate: ({ foo, bar, baz }) => {
          const errors: { foo?: string; bar?: string; baz?: string } = {};
          if (!foo.length) errors.foo = error;
          if (!bar.length) errors.bar = error;
          if (!baz.length) errors.baz = error;
          return errors;
        },
        children: (
          <>
            <input data-testid="foo" name="foo" />
            <input data-testid="bar" name="bar" />
            <input data-testid="baz" name="baz" />
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
  });

  describe("mon", () => {
    const { values, isValid } = { ...initialState, values: { foo: "🍎" } };

    it('should return undefined if "path" isn\'t set', () => {
      const { mon } = renderHelper();
      // @ts-expect-error
      expect(mon()).toBeUndefined();
    });

    it("should get default value correctly", () => {
      const formValue = { foo: null };
      const selectValue = { foo: "🍎" };
      let { mon } = renderHelper({ defaultValues: formValue });
      expect(mon("values.foo")).toBe(formValue.foo);

      expect(mon("values.foo", { defaultValues: selectValue })).toBe(
        formValue.foo
      );

      mon = renderHelper().mon;
      expect(mon("values.foo", { defaultValues: selectValue })).toBe(
        selectValue.foo
      );

      expect(mon("values.foo")).toBeUndefined();
    });

    it.todo("should get default value correctly with conditional field");

    it("should get state with correct format", () => {
      const { mon } = renderHelper({ defaultValues: values });

      expect(mon("values")).toEqual(values);
      expect(mon("values.foo")).toBe(values.foo);
      expect(mon("isValid")).toBe(isValid);

      expect(mon(["values", "values.foo", "isValid"])).toEqual([
        values,
        values.foo,
        isValid,
      ]);

      expect(
        mon({
          values: "values",
          foo: "values.foo",
          isValid: "isValid",
        })
      ).toEqual({ values, foo: values.foo, isValid });
    });

    it("should get form's values by shortcut", () => {
      const { mon } = renderHelper({ defaultValues: values });
      const { foo } = values;
      expect(mon("foo")).toBe(foo);
      expect(mon(["foo"])).toEqual([foo]);
      expect(mon({ foo: "foo" })).toEqual({ foo });
    });

    it("should get error with touched", async () => {
      const { mon } = renderHelper({
        children: <input data-testid="foo" name="foo" required />,
      });
      const foo = getByTestId("foo");

      fireEvent.input(foo, { target: { value: "" } });
      await waitFor(() => {
        expect(mon("errors.foo")).not.toBeUndefined();
        expect(mon("errors.foo", { errorWithTouched: true })).toBeUndefined();
      });

      fireEvent.focusOut(foo);
      await waitFor(() => {
        expect(
          mon("errors.foo", { errorWithTouched: true })
        ).not.toBeUndefined();
      });
    });

    it("should trigger re-rendering", () => {
      const { mon } = renderHelper({
        onRender,
        children: <input data-testid="foo" name="foo" />,
      });
      mon("values.foo");
      fireEvent.input(getByTestId("foo"));
      expect(onRender).toHaveBeenCalledTimes(2);
    });
  });

  describe("getState", () => {
    const state = { ...initialState, values: { foo: "🍎" } };
    const { values, isValid } = state;

    it("should get state", () => {
      const { getState } = renderHelper({ defaultValues: values });
      expect(getState()).toEqual(state);
    });

    it("should get state with correct format", () => {
      const { getState } = renderHelper({ defaultValues: values });

      expect(getState("values")).toEqual(values);
      expect(getState("values.foo")).toBe(values.foo);
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

    it("should get value without key", () => {
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
      getState("values.foo");
      fireEvent.input(getByTestId("foo"));
      expect(onRender).toHaveBeenCalledTimes(1);
    });
  });

  describe("setValue", () => {
    it("should set value correctly", () => {
      const { setValue, getState } = renderHelper();
      const value = "🍎";

      setValue("foo", value);
      expect(getState("values.foo")).toBe(value);

      setValue("foo", (prevValue: string) => prevValue);
      expect(getState("values.foo")).toBe(value);

      setValue("foo.a[0].b", value);
      expect(getState("values.foo.a[0].b")).toBe(value);

      setValue("foo");
      expect(getState("values.foo")).toBeUndefined();
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
        children: ({ field }: Methods) => (
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
      fireEvent.input(getByTestId("foo"), {
        target: { value: "1970-01-01" },
      });
      fireEvent.submit(getByTestId("form"));
      await waitFor(() =>
        // @ts-expect-error
        expect(onSubmit).toHaveBeenCalledWith({ foo: value[type] })
      );
    }
  );

  it("should call debug callback", async () => {
    const debug = jest.fn();
    renderHelper({ debug, children: <input data-testid="foo" name="foo" /> });
    const value = "🍎";
    fireEvent.input(getByTestId("foo"), { target: { value } });
    await waitFor(() => {
      expect(debug).toHaveBeenCalledTimes(3);
      expect(debug).toHaveBeenCalledWith({
        ...{
          ...initialState,
          values: { foo: "" },
          dirty: { foo: true },
          isDirty: true,
        },
        values: { foo: value },
      });
    });
  });
});
