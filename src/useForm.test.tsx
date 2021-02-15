import {
  render,
  fireEvent,
  waitFor,
  screen,
  act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Config, Return, SubmitHandler, ErrorHandler } from "./types";
import { isFunction } from "./utils";
import useForm from "./useForm";

type Methods = Omit<Return<any>, "form">;

type Children = JSX.Element | JSX.Element[] | null;

interface Conf extends Config<any> {
  children: Children | ((methods: Methods) => Children);
  onSubmit: (values: any) => void;
  onSubmitFull: SubmitHandler<any>;
  onError: (errors: any) => void;
  onErrorFull: ErrorHandler<any>;
  onRender: () => void;
}

type Props = Partial<Conf>;

const Form = ({
  children,
  onSubmit = () => null,
  onSubmitFull,
  onError = () => null,
  onErrorFull,
  onRender = () => null,
  ...config
}: Props) => {
  const { form, ...rest } = useForm({
    ...config,
    onSubmit: (...args) =>
      onSubmitFull ? onSubmitFull(...args) : onSubmit(args[0]),
    onError: (...args) =>
      onErrorFull ? onErrorFull(...args) : onError(args[0]),
  });

  onRender();

  return (
    <form data-testid="form" ref={form}>
      {isFunction(children) ? children({ ...rest }) : children}
    </form>
  );
};

const CustomField = ({ value, onChange }: any) => (
  <button
    data-testid="custom"
    // @ts-expect-error
    onClick={(e) => onChange(e.target.value)}
    type="button"
  >
    {value}
  </button>
);

const renderHelper = ({ children = null, ...rest }: Props = {}) => {
  let api: Methods;

  render(
    <Form {...rest}>
      {(methods) => {
        api = methods;
        return isFunction(children) ? children(methods) : children;
      }}
    </Form>
  );

  // @ts-expect-error
  return api;
};

describe("useForm", () => {
  const getByTestId = screen.getByTestId as any;
  const onSubmit = jest.fn();
  const onError = jest.fn();
  const onReset = jest.fn();
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
      console.warn = jest.fn();
      renderHelper({
        children: <input data-testid="foo" />,
      });
      fireEvent.input(getByTestId("foo"));
      expect(console.warn).toHaveBeenCalledTimes(2);
      expect(console.warn).toHaveBeenCalledWith(
        '💡 react-cool-form > field: Missing the "name" attribute.'
      );
    });

    it("should not warn for a missing name field when it's excluded", () => {
      console.warn = jest.fn();
      renderHelper({ children: <input data-rcf-exclude /> });
      expect(console.warn).not.toHaveBeenCalled();
    });

    it('should warn select "values" alone', () => {
      console.warn = jest.fn();
      const { select } = renderHelper();
      select("values");
      expect(console.warn).toHaveBeenCalledWith(
        '💡 react-cool-form > select: Getting the "values" alone may cause unnecessary re-renders. If you know what you\'re doing, please ignore this warning. See: https://react-cool-form.netlify.app/docs/getting-started/form-state#best-practices'
      );
    });

    it("should warn form-level validation exception", async () => {
      console.warn = jest.fn();
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

    it("should warn field-level validation exception", async () => {
      console.warn = jest.fn();
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

    it("should not warn in production", () => {
      // @ts-expect-error
      global.__DEV__ = false;
      console.warn = jest.fn();
      renderHelper({ children: <input /> });
      expect(console.warn).not.toHaveBeenCalled();
    });
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
    });

    setValue("foo", "🍎");
    setError("foo", "Required");
    const e = {};
    // @ts-expect-error
    act(() => reset(null, null, e));
    expect(onReset).toHaveBeenCalledWith(defaultValues, options, e);
    expect(getState()).toEqual({ ...initialState, values: defaultValues });

    const values = { foo: "🍋" };
    // @ts-expect-error
    act(() => reset(values, null, e));
    expect(onReset).toHaveBeenCalledWith(values, options, e);
    expect(getState()).toEqual({ ...initialState, values });

    const value = "🍎";
    // @ts-expect-error
    act(() => reset((prevValues) => ({ ...prevValues, foo: value }), null, e));
    expect(onReset).toHaveBeenCalledWith({ foo: value }, options, e);
    expect(getState()).toEqual({ ...initialState, values: { foo: value } });

    const error = "Required";
    setValue("foo", value);
    setError("foo", error);
    // @ts-expect-error
    act(() => reset(null, ["values", "errors", "touched"], e));
    expect(onReset).toHaveBeenCalledWith({ foo: value }, options, e);
    expect(getState()).toEqual({
      ...initialState,
      values: { foo: value },
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
      renderHelper({ defaultValues, onSubmit, children: getChildren() });
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
  });

  describe("handle change", () => {
    it.each(["text", "number", "range"])(
      "should handle %s change correctly",
      async (type) => {
        const { getState } = renderHelper({
          defaultValues: { foo: "" },
          onSubmit,
          children: <input data-testid="foo" name="foo" type={type} />,
        });
        const values: any = {
          text: "🍎",
          number: 1,
          range: 10,
        };
        fireEvent.input(getByTestId("foo"), {
          target: { value: values[type] },
        });
        fireEvent.submit(getByTestId("form"));
        await waitFor(() =>
          expect(onSubmit).toHaveBeenCalledWith({ foo: values[type] })
        );
        expect(getState("touched.foo")).toBeTruthy();
        expect(getState("dirty.foo")).toBeTruthy();
        expect(getState("isDirty")).toBeTruthy();
      }
    );

    it("should handle checkbox change correctly", async () => {
      const { getState } = renderHelper({
        defaultValues: { foo: false },
        onSubmit,
        children: <input data-testid="foo" name="foo" type="checkbox" />,
      });
      userEvent.click(getByTestId("foo"));
      fireEvent.submit(getByTestId("form"));
      await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ foo: true }));
      expect(getState("touched.foo")).toBeTruthy();
      expect(getState("dirty.foo")).toBeTruthy();
      expect(getState("isDirty")).toBeTruthy();
    });

    it("should handle checkboxes change correctly", async () => {
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

      expect(getState("touched.foo")).toBeTruthy();
      expect(getState("dirty.foo")).toBeTruthy();
      expect(getState("isDirty")).toBeTruthy();
    });

    it("should handle radio buttons change correctly", async () => {
      const { getState } = renderHelper({
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

      expect(getState("touched.foo")).toBeTruthy();
      expect(getState("dirty.foo")).toBeTruthy();
      expect(getState("isDirty")).toBeTruthy();
    });

    it("should handle textarea change correctly", async () => {
      const { getState } = renderHelper({
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
      expect(getState("touched.foo")).toBeTruthy();
      expect(getState("dirty.foo")).toBeTruthy();
      expect(getState("isDirty")).toBeTruthy();
    });

    it("should handle select change correctly", async () => {
      const { getState } = renderHelper({
        defaultValues: { foo: "" },
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

      fireEvent.input(foo, { target: { value: foo0.value } });
      fireEvent.submit(form);
      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith({ foo: foo0.value })
      );

      fireEvent.input(foo, { target: { value: foo1.value } });
      fireEvent.submit(form);
      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith({ foo: foo1.value })
      );

      expect(getState("touched.foo")).toBeTruthy();
      expect(getState("dirty.foo")).toBeTruthy();
      expect(getState("isDirty")).toBeTruthy();
    });

    it("should handle multiple select change correctly", async () => {
      const { getState } = renderHelper({
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

      expect(getState("touched.foo")).toBeTruthy();
      expect(getState("dirty.foo")).toBeTruthy();
      expect(getState("isDirty")).toBeTruthy();
    });

    it("should handle file change correctly", async () => {
      const { getState } = renderHelper({
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
      expect(getState("touched.foo")).toBeTruthy();
      expect(getState("dirty.foo")).toBeTruthy();
      expect(getState("isDirty")).toBeTruthy();
    });

    it("should handle files change correctly", async () => {
      const { getState } = renderHelper({
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
      expect(getState("touched.foo")).toBeTruthy();
      expect(getState("dirty.foo")).toBeTruthy();
      expect(getState("isDirty")).toBeTruthy();
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
      }
    );

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
  });

  describe("exclude fields", () => {
    const defaultValues = { foo: "🍋" };
    const e = { target: { value: "🍎" } };

    it("should exclude a field via excludeFields option", async () => {
      renderHelper({
        defaultValues,
        excludeFields: ["foo"],
        onSubmit,
        children: <input data-testid="foo" name="foo" />,
      });
      const foo = getByTestId("foo") as HTMLInputElement;
      expect(foo.value).toBe("");
      fireEvent.input(foo, e);
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

  describe("select", () => {
    const { values, isValid } = { ...initialState, values: { foo: "🍎" } };

    it('should return undefined if "path" isn\'t set', () => {
      const { select } = renderHelper();
      // @ts-expect-error
      expect(select()).toBeUndefined();
    });

    it("should select state with correct format", () => {
      const { select } = renderHelper({ defaultValues: values });

      expect(select("values")).toEqual(values);
      expect(select("values.foo")).toBe(values.foo);
      expect(select("isValid")).toBe(isValid);

      expect(select(["values", "values.foo", "isValid"])).toEqual([
        values,
        values.foo,
        isValid,
      ]);

      expect(
        select({
          values: "values",
          foo: "values.foo",
          isValid: "isValid",
        })
      ).toEqual({ values, foo: values.foo, isValid });
    });

    it("should select state with specific target", () => {
      const { select } = renderHelper({ defaultValues: values });
      const option = { target: "values" };
      const { foo } = values;
      expect(select("foo", option)).toBe(foo);
      expect(select(["foo"], option)).toEqual([foo]);
      expect(select({ foo: "foo" }, option)).toEqual({ foo });
    });

    it("should select error with touched", async () => {
      const { select } = renderHelper({
        children: <input data-testid="foo" name="foo" required />,
      });
      const foo = getByTestId("foo");
      fireEvent.input(foo, { target: { value: "" } });
      await waitFor(() => {
        expect(select("errors.foo")).not.toBeUndefined();
        expect(
          select("errors.foo", { errorWithTouched: true })
        ).toBeUndefined();
      });
      fireEvent.focusOut(foo);
      await waitFor(() => {
        expect(
          select("errors.foo", { errorWithTouched: true })
        ).not.toBeUndefined();
      });
    });

    it("should trigger re-rendering", () => {
      const onRender = jest.fn();
      const { select } = renderHelper({
        onRender,
        children: <input data-testid="foo" name="foo" />,
      });
      select("values.foo");
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

    it("should get state with specific target", () => {
      const { getState } = renderHelper({ defaultValues: values });
      const target = "values";
      const { foo } = values;
      expect(getState("foo", target)).toBe(foo);
      expect(getState(["foo"], target)).toEqual([foo]);
      expect(getState({ foo: "foo" }, target)).toEqual({ foo });
    });

    it("should not trigger re-rendering", () => {
      const onRender = jest.fn();
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

  describe("controller", () => {
    const value = "🍎";

    it("should warn for a missing name controller", () => {
      console.warn = jest.fn();
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
      const { getState } = renderHelper({
        defaultValues: { text: "" },
        onSubmit,
        children: ({ controller }: Methods) => (
          <>
            <input data-testid="text" {...controller("text")} />
            <input
              data-testid="checkbox"
              {...controller("checkbox")}
              type="checkbox"
            />
          </>
        ),
      });
      const textValue = "🍎";
      fireEvent.input(getByTestId("text"), { target: { value: textValue } });
      userEvent.click(getByTestId("checkbox"));
      fireEvent.submit(getByTestId("form"));
      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith({
          text: textValue,
          checkbox: true,
        })
      );
      expect(getState("touched.text")).toBeTruthy();
      expect(getState("dirty.text")).toBeTruthy();
      expect(getState("touched.checkbox")).toBeTruthy();
      expect(getState("dirty.checkbox")).toBeTruthy();
      expect(getState("isDirty")).toBeTruthy();
    });

    it("should handle custom field change correctly", async () => {
      const { getState } = renderHelper({
        defaultValues: { foo: 0 },
        onSubmit,
        children: ({ controller }: Methods) => (
          <CustomField {...controller("foo")} />
        ),
      });
      fireEvent.click(getByTestId("custom"), { target: { value } });
      fireEvent.submit(getByTestId("form"));
      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith({ foo: value })
      );
      expect(getState("touched.foo")).toBeTruthy();
      expect(getState("dirty.foo")).toBeTruthy();
      expect(getState("isDirty")).toBeTruthy();
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
              validate: async (val: string) =>
                !val.length ? errors.foo : false,
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

  it("should call debug callback", async () => {
    const debug = jest.fn();
    renderHelper({ debug, children: <input data-testid="foo" name="foo" /> });
    const value = "🍎";
    fireEvent.input(getByTestId("foo"), { target: { value } });
    await waitFor(() => {
      expect(debug).toHaveBeenCalledTimes(2);
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
