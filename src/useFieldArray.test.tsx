/* eslint-disable react/no-unused-prop-types */

import { Dispatch, useState } from "react";
import {
  render,
  fireEvent,
  screen,
  act,
  waitFor,
} from "@testing-library/react";

import {
  FieldArrayConfig,
  FieldNamesLike,
  FormMethods,
  Insert,
  Move,
  Push,
  Remove,
  Swap,
} from "./types";
import useForm from "./useForm";
import useFieldArray from "./useFieldArray";
import useControlled from "./useControlled";

type API = Omit<FormMethods, "form"> & {
  fields: string[];
  insert: Insert;
  move: Move;
  push: Push;
  remove: Remove;
  swap: Swap;
  show: boolean;
  setShow: Dispatch<boolean>;
};

interface Config extends FieldArrayConfig {
  children: (api: API) => JSX.Element | JSX.Element[] | null;
  isShow: boolean;
  defaultValues: any;
  validateOnChange: boolean;
  removeOnUnmounted: FieldNamesLike;
  formValidate: (values: any) => void;
  onSubmit: (values: any) => void;
  onRender: () => void;
}

type Props = Partial<Config>;

const Form = ({
  children,
  isShow,
  formId,
  defaultValues,
  validateOnChange,
  removeOnUnmounted,
  formValidate,
  onSubmit = () => null,
  onRender = () => null,
  ...rest
}: Props) => {
  const [show, setShow] = useState(!!isShow);
  const { form, ...methods } = useForm({
    id: formId,
    defaultValues,
    removeOnUnmounted,
    validateOnChange,
    validate: formValidate,
    onSubmit: (values) => onSubmit(values),
  });
  const [fields, helpers] = useFieldArray("foo", { ...rest, formId });

  onRender();

  return (
    <form data-testid="form" ref={form}>
      {children
        ? children({
            ...methods,
            fields,
            ...helpers,
            show,
            setShow,
          })
        : null}
    </form>
  );
};

const renderHelper = ({ children, ...rest }: Props = {}) => {
  let api: API;

  const { container } = render(
    <Form {...rest}>
      {(a) => {
        api = a;
        return children ? children(a) : null;
      }}
    </Form>
  );

  // @ts-expect-error
  return { ...api, container };
};

const Field = ({ name, ...rest }: any) => {
  const [props] = useControlled(name, rest);
  return <input {...props} />;
};

const FieldArray = (props: any) => {
  const [fields] = useFieldArray("foo", props);
  return (
    <>
      {fields.map((name) => (
        <div key={name}>
          <input data-testid={`${name}.a`} name={`${name}.a`} />
          <Field data-testid={`${name}.b`} name={`${name}.b`} />
        </div>
      ))}
    </>
  );
};

describe("useFieldArray", () => {
  const onSubmit = jest.fn();
  const onRender = jest.fn();
  const value = [{ a: "🍎", b: "🍎" }];

  beforeEach(() => jest.clearAllMocks());

  it("should throw form ID error", () => {
    expect(() => useFieldArray("values", { formId: "form-1" })).toThrow(
      '💡 react-cool-form > useFieldArray: It must work with an "useForm" hook. See: https://react-cool-form.netlify.app/docs/api-reference/use-form'
    );
  });

  it.each(["form", "array"])(
    "should set default value correctly from %s option",
    async (type) => {
      renderHelper({
        defaultValues: type === "form" ? { foo: value } : undefined,
        defaultValue: type === "array" ? value : undefined,
        onSubmit,
        children: ({ fields }: API) =>
          fields.map((name) => (
            <div key={name}>
              <input data-testid={`${name}.a`} name={`${name}.a`} />
              <Field data-testid={`${name}.b`} name={`${name}.b`} />
            </div>
          )),
      });
      expect(screen.getAllByRole("textbox")).toHaveLength(2);
      expect((screen.getByTestId("foo[0].a") as HTMLInputElement).value).toBe(
        value[0].a
      );
      expect((screen.getByTestId("foo[0].b") as HTMLInputElement).value).toBe(
        value[0].b
      );
      fireEvent.submit(screen.getByTestId("form"));
      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith({ foo: value })
      );
    }
  );

  it("should use form-level default value first", async () => {
    const defaultValues = { foo: value };
    renderHelper({
      defaultValues,
      defaultValue: [{ a: "🍋" }],
      onSubmit,
    });
    fireEvent.submit(screen.getByTestId("form"));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(defaultValues));
  });

  it.each([undefined, true, value])(
    'should return "fields" correctly',
    (val) => {
      const { fields, getState } = renderHelper({
        defaultValues: { foo: val },
      });
      expect(fields).toEqual(Array.isArray(val) ? ["foo[0]"] : []);
      expect(getState("foo")).toEqual(val);
    }
  );

  it("should push value correctly", async () => {
    const { push, getState } = renderHelper({
      defaultValues: { foo: value },
      onRender,
      children: ({ fields }: API) =>
        fields.map((name) => (
          <div key={name}>
            <input data-testid={`${name}.a`} name={`${name}.a`} />
            <Field data-testid={`${name}.b`} name={`${name}.b`} />
          </div>
        )),
    });
    const newValue1 = { a: "🍋", b: "🍋" };
    const newValue2 = { a: "🥝", b: "🥝" };
    act(() => {
      push(newValue1, { shouldDirty: false });
      push(newValue2, { shouldTouched: true });
    });
    expect(screen.getAllByRole("textbox")).toHaveLength(6);
    await waitFor(() => {
      expect((screen.getByTestId("foo[1].a") as HTMLInputElement).value).toBe(
        newValue1.a
      );
      expect((screen.getByTestId("foo[1].b") as HTMLInputElement).value).toBe(
        newValue1.b
      );
      expect((screen.getByTestId("foo[2].a") as HTMLInputElement).value).toBe(
        newValue2.a
      );
      expect((screen.getByTestId("foo[2].b") as HTMLInputElement).value).toBe(
        newValue2.b
      );
    });
    expect(getState("foo")).toEqual([...value, newValue1, newValue2]);
    expect(getState("dirty.foo")).toEqual([, , { a: true, b: true }]);
    expect(getState("touched.foo")).toEqual([, , { a: true, b: true }]);
    expect(onRender).toHaveBeenCalledTimes(2);
  });

  it("should insert value correctly", async () => {
    const { insert, getState } = renderHelper({
      defaultValues: { foo: value },
      onRender,
      children: ({ fields }: API) =>
        fields.map((name) => (
          <div key={name}>
            <input data-testid={`${name}.a`} name={`${name}.a`} />
            <Field data-testid={`${name}.b`} name={`${name}.b`} />
          </div>
        )),
    });

    let val = [...value, { a: "🍋", b: "🍋" }];
    act(() => insert(1, val[1], { shouldTouched: true }));
    expect(screen.getAllByRole("textbox")).toHaveLength(4);
    await waitFor(() => {
      expect((screen.getByTestId("foo[1].a") as HTMLInputElement).value).toBe(
        val[1].a
      );
      expect((screen.getByTestId("foo[1].b") as HTMLInputElement).value).toBe(
        val[1].b
      );
    });
    expect(getState("foo")).toEqual(val);
    expect(getState("dirty.foo")).toEqual([, { a: true, b: true }]);
    expect(getState("touched.foo")).toEqual([, { a: true, b: true }]);
    expect(onRender).toHaveBeenCalledTimes(2);

    val = [...val, { a: "🥝", b: "🥝" }];
    act(() => insert(2, val[2], { shouldDirty: false }));
    expect(screen.getAllByRole("textbox")).toHaveLength(6);
    await waitFor(() => {
      expect((screen.getByTestId("foo[2].a") as HTMLInputElement).value).toBe(
        val[2].a
      );
      expect((screen.getByTestId("foo[2].b") as HTMLInputElement).value).toBe(
        val[2].b
      );
    });
    expect(getState("foo")).toEqual(val);
    expect(getState("dirty.foo")).toEqual([, { a: true, b: true }]);
    expect(getState("touched.foo")).toEqual([, { a: true, b: true }]);

    val = [{ a: "🍒", b: "🍒" }, ...val];
    act(() => insert(0, val[0], { shouldDirty: false }));
    expect(screen.getAllByRole("textbox")).toHaveLength(8);
    await waitFor(() => {
      expect((screen.getByTestId("foo[0].a") as HTMLInputElement).value).toBe(
        val[0].a
      );
      expect((screen.getByTestId("foo[0].b") as HTMLInputElement).value).toBe(
        val[0].b
      );
    });
    expect(getState("foo")).toEqual(val);
    expect(getState("dirty.foo")).toEqual([, , { a: true, b: true }]);
    expect(getState("touched.foo")).toEqual([, , { a: true, b: true }]);
  });

  it.each(["swap", "move"])("should %s values correctly", (type) => {
    const { push, swap, move, getState } = renderHelper({
      defaultValues: { foo: value },
      onRender,
      children: ({ fields }: API) =>
        fields.map((name) => (
          <div key={name}>
            <input name={`${name}.a`} />
            <Field name={`${name}.b`} />
          </div>
        )),
    });
    const newValue = { a: "🍋", b: "🍋" };
    act(() => {
      push(newValue, { shouldTouched: true });
      if (type === "swap") {
        swap(0, 1);
      } else {
        move(1, 0);
      }
    });
    expect(getState("foo")).toEqual([newValue, ...value]);
    expect(getState("touched.foo")).toEqual([{ a: true, b: true }, undefined]);
    expect(getState("dirty.foo")).toEqual([{ a: true, b: true }, undefined]);
    expect(onRender).toHaveBeenCalledTimes(2);
  });

  it("should remove value correctly", () => {
    const { push, remove, getState } = renderHelper({
      onRender,
      children: ({ fields }: API) =>
        fields.map((name) => (
          <div key={name}>
            <input name={`${name}.a`} />
            <Field name={`${name}.b`} />
          </div>
        )),
    });
    const val = [...value, { a: "🍋", b: "🍋" }];
    act(() => {
      push(val[0], { shouldTouched: true });
      push(val[1], { shouldTouched: true });
      expect(remove(1)).toEqual(val[1]);
    });
    expect(getState("foo")).toEqual([val[0]]);
    expect(getState("dirty.foo")).toEqual([{ a: true, b: true }]);
    expect(getState("touched.foo")).toEqual([{ a: true, b: true }]);
    act(() => expect(remove(0)).toEqual(val[0]));
    expect(getState("foo")).toEqual([]);
    expect(getState("dirty.foo")).toEqual([]);
    expect(getState("touched.foo")).toEqual([]);
  });

  it("should set value correctly", () => {
    const defaultValue = [...value, { a: "🍋", b: "🍋" }];
    const { setValue, reset, getState, push, remove } = renderHelper({
      defaultValues: { foo: defaultValue },
      children: ({ fields }: API) =>
        fields.map((name) => (
          <div key={name}>
            <input data-testid={`${name}.a`} name={`${name}.a`} />
            <Field data-testid={`${name}.b`} name={`${name}.b`} />
          </div>
        )),
    });
    const fooA = screen.getByTestId("foo[0].a") as HTMLInputElement;
    const fooB = screen.getByTestId("foo[0].b") as HTMLInputElement;
    const target = { value: "🥝" };

    fireEvent.input(fooA, { target });
    fireEvent.input(fooB, { target });
    act(() => setValue("foo", defaultValue));
    expect(fooA.value).toBe(defaultValue[0].a);
    expect(fooB.value).toBe(defaultValue[0].b);
    expect(getState("foo")).toEqual(defaultValue);

    act(() => push({ a: "🍒", b: "🍒" }));
    fireEvent.input(fooA, { target });
    fireEvent.input(fooB, { target });
    act(() => setValue("foo", defaultValue));
    expect(screen.getAllByRole("textbox")).toHaveLength(4);
    expect(fooA.value).toBe(defaultValue[0].a);
    expect(fooB.value).toBe(defaultValue[0].b);
    expect(getState("foo")).toEqual(defaultValue);

    act(() => {
      reset();
      remove(1);
    });
    fireEvent.input(fooA, { target });
    fireEvent.input(fooB, { target });
    act(() => setValue("foo", defaultValue));
    expect(screen.getAllByRole("textbox")).toHaveLength(4);
    expect(fooA.value).toBe(defaultValue[0].a);
    expect(fooB.value).toBe(defaultValue[0].b);
    expect(getState("foo")).toEqual(defaultValue);
  });

  it.each(["form", "array"])(
    "should reset value correctly from %s default option",
    (type) => {
      const defaultValue = [...value, { a: "🍋", b: "🍋" }];
      const { reset, getState, push, remove } = renderHelper({
        defaultValues: type === "form" ? { foo: defaultValue } : undefined,
        defaultValue: type === "array" ? defaultValue : undefined,
        children: ({ fields }: API) =>
          fields.map((name) => (
            <div key={name}>
              <input data-testid={`${name}.a`} name={`${name}.a`} />
              <Field data-testid={`${name}.b`} name={`${name}.b`} />
            </div>
          )),
      });
      const fooA = screen.getByTestId("foo[0].a") as HTMLInputElement;
      const fooB = screen.getByTestId("foo[0].b") as HTMLInputElement;
      const target = { value: "🥝" };

      fireEvent.input(fooA, { target });
      fireEvent.input(fooB, { target });
      act(() => reset());
      expect(fooA.value).toBe(defaultValue[0].a);
      expect(fooB.value).toBe(defaultValue[0].b);
      expect(getState("foo")).toEqual(defaultValue);
      expect(getState("touched.foo")).toBeUndefined();
      expect(getState("dirty.foo")).toBeUndefined();

      act(() => push({ a: "🍒", b: "🍒" }));
      fireEvent.input(fooA, { target });
      fireEvent.input(fooB, { target });
      act(() => reset());
      expect(screen.getAllByRole("textbox")).toHaveLength(4);
      expect(fooA.value).toBe(defaultValue[0].a);
      expect(fooB.value).toBe(defaultValue[0].b);
      expect(getState("foo")).toEqual(defaultValue);
      expect(getState("touched.foo")).toBeUndefined();
      expect(getState("dirty.foo")).toBeUndefined();

      act(() => {
        remove(1);
      });
      fireEvent.input(fooA, { target });
      fireEvent.input(fooB, { target });
      act(() => reset());
      expect(screen.getAllByRole("textbox")).toHaveLength(4);
      expect(fooA.value).toBe(defaultValue[0].a);
      expect(fooB.value).toBe(defaultValue[0].b);
      expect(getState("foo")).toEqual(defaultValue);
      expect(getState("touched.foo")).toBeUndefined();
      expect(getState("dirty.foo")).toBeUndefined();
    }
  );

  it.each(["form", "array"])("should run %s-level validation", async (type) => {
    const error = "Required";
    const { remove, getState } = renderHelper({
      defaultValues: { foo: value },
      formValidate:
        type === "form"
          ? ({ foo }) => (!foo.length ? { foo: error } : {})
          : undefined,
      validate:
        type === "array" ? (val) => (!val.length ? error : false) : undefined,
    });
    act(() => {
      remove(0);
    });
    await waitFor(() => expect(getState("errors.foo")).toBe(error));
  });

  it("should not run validation", () => {
    const validate = jest.fn();
    const { remove } = renderHelper({
      validateOnChange: false,
      validate,
    });
    act(() => {
      remove(0);
    });
    expect(validate).not.toHaveBeenCalled();
  });

  describe("conditional fields", () => {
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
    const formValue = value;
    const fieldValue = [{ a: "🍋", b: "🍋" }];

    it("should set form-level default value correctly (FieldArray)", async () => {
      const { getState, setError, setTouched, setDirty, setShow } =
        renderHelper({
          defaultValues: { foo: formValue },
          children: ({ show }: API) => <>{show && <FieldArray />}</>,
        });

      act(() => setShow(true));
      await waitFor(() => {
        expect(getState()).toEqual({
          ...initialState,
          values: { foo: formValue },
        });
        expect((screen.getByTestId("foo[0].a") as HTMLInputElement).value).toBe(
          formValue[0].a
        );
        expect((screen.getByTestId("foo[0].b") as HTMLInputElement).value).toBe(
          formValue[0].b
        );
      });

      act(() => {
        setError("foo", [{ a: "Required", b: "Required" }]);
        setTouched("foo[0].a", true, { shouldValidate: false });
        setTouched("foo[0].b", true, { shouldValidate: false });
        setDirty("foo[0].a");
        setDirty("foo[0].b");
        setShow(false);
      });
      await waitFor(() => expect(getState()).toEqual(initialState));

      act(() => setShow(true));
      await waitFor(() => {
        expect(getState()).toEqual({
          ...initialState,
          values: {},
        });
        expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
      });
    });

    it("should set array-level default value correctly (FieldArray)", async () => {
      const { getState, setError, setTouched, setDirty, setShow } =
        renderHelper({
          children: ({ show }: API) => (
            <>{show && <FieldArray defaultValue={fieldValue} />}</>
          ),
        });

      act(() => setShow(true));
      await waitFor(() => {
        expect(getState()).toEqual({
          ...initialState,
          values: { foo: fieldValue },
        });
        expect((screen.getByTestId("foo[0].a") as HTMLInputElement).value).toBe(
          fieldValue[0].a
        );
        expect((screen.getByTestId("foo[0].b") as HTMLInputElement).value).toBe(
          fieldValue[0].b
        );
      });

      act(() => {
        setError("foo", [{ a: "Required", b: "Required" }]);
        setTouched("foo[0].a", true, { shouldValidate: false });
        setTouched("foo[0].b", true, { shouldValidate: false });
        setDirty("foo[0].a");
        setDirty("foo[0].b");
        setShow(false);
      });
      await waitFor(() => expect(getState()).toEqual(initialState));

      act(() => setShow(true));
      await waitFor(() => {
        expect(getState()).toEqual({
          ...initialState,
          values: { foo: fieldValue },
        });
        expect((screen.getByTestId("foo[0].a") as HTMLInputElement).value).toBe(
          fieldValue[0].a
        );
        expect((screen.getByTestId("foo[0].b") as HTMLInputElement).value).toBe(
          fieldValue[0].b
        );
      });
    });

    it.each(["form", "array", "field"])(
      "should set %s-level default value correctly (input/Field)",
      async (type) => {
        const { getState, setError, setTouched, setDirty, setShow } =
          renderHelper({
            defaultValues: type === "form" ? { foo: formValue } : undefined,
            defaultValue:
              // eslint-disable-next-line no-nested-ternary
              type === "array"
                ? fieldValue
                : type === "field"
                ? [{}]
                : undefined,
            children: ({ fields, show }: API) =>
              fields.map((name) => (
                <div key={name}>
                  {show && (
                    <input
                      data-testid={`${name}.a`}
                      name={`${name}.a`}
                      defaultValue={
                        type === "field" ? fieldValue[0].a : undefined
                      }
                    />
                  )}
                  {show && (
                    <Field
                      data-testid={`${name}.b`}
                      name={`${name}.b`}
                      defaultValue={
                        type === "field" ? fieldValue[0].b : undefined
                      }
                    />
                  )}
                </div>
              )),
          });

        act(() => setShow(true));
        const state = {
          ...initialState,
          values: { foo: type === "form" ? formValue : fieldValue },
        };
        await waitFor(() => {
          expect(getState()).toEqual(state);
          expect(
            (screen.getByTestId("foo[0].a") as HTMLInputElement).value
          ).toBe(type === "form" ? formValue[0].a : fieldValue[0].a);
          expect(
            (screen.getByTestId("foo[0].b") as HTMLInputElement).value
          ).toBe(type === "form" ? formValue[0].b : fieldValue[0].b);
        });

        act(() => {
          setError("foo", [{ a: "Required", b: "Required" }]);
          setTouched("foo[0].a", true, { shouldValidate: false });
          setTouched("foo[0].b", true, { shouldValidate: false });
          setDirty("foo[0].a");
          setDirty("foo[0].b");
          setShow(false);
        });
        await waitFor(() => expect(getState()).toEqual(initialState));

        act(() => setShow(true));
        await waitFor(() => {
          expect(getState()).toEqual(state);
          expect(
            (screen.getByTestId("foo[0].a") as HTMLInputElement).value
          ).toBe(type === "form" ? formValue[0].a : fieldValue[0].a);
          expect(
            (screen.getByTestId("foo[0].b") as HTMLInputElement).value
          ).toBe(type === "form" ? formValue[0].b : fieldValue[0].b);
        });
      }
    );

    it.each([false, [], () => []])(
      "should not remove field (FieldArray)",
      async (removeOnUnmounted) => {
        const { getState, setError, setTouched, setDirty, setShow } =
          renderHelper({
            isShow: true,
            defaultValues: { foo: formValue },
            removeOnUnmounted,
            children: ({ show }: API) => <>{show && <FieldArray />}</>,
          });

        act(() => {
          setError("foo", [{ a: "Required", b: "Required" }]);
          setTouched("foo[0].a", true, { shouldValidate: false });
          setTouched("foo[0].b", true, { shouldValidate: false });
          setDirty("foo[0].a");
          setDirty("foo[0].b");
          setShow(false);
        });
        await waitFor(() =>
          expect(getState()).toEqual({
            ...initialState,
            values: { foo: formValue },
            errors: { foo: [{ a: "Required", b: "Required" }] },
            isValid: false,
            touched: { foo: [{ a: true, b: true }] },
            dirty: { foo: [{ a: true, b: true }] },
            isDirty: true,
          })
        );

        act(() => setShow(true));
        await waitFor(() => {
          expect(
            (screen.getByTestId("foo[0].a") as HTMLInputElement).value
          ).toBe(formValue[0].a);
          expect(
            (screen.getByTestId("foo[0].b") as HTMLInputElement).value
          ).toBe(formValue[0].b);
        });
      }
    );

    it.each([false, [], () => []])(
      "should not remove field (input/Field)",
      async (removeOnUnmounted) => {
        const { getState, setError, setTouched, setDirty, setShow } =
          renderHelper({
            isShow: true,
            defaultValues: { foo: formValue },
            removeOnUnmounted,
            children: ({ fields, show }: API) =>
              fields.map((name) => (
                <div key={name}>
                  {show && (
                    <input data-testid={`${name}.a`} name={`${name}.a`} />
                  )}
                  {show && (
                    <Field data-testid={`${name}.b`} name={`${name}.b`} />
                  )}
                </div>
              )),
          });

        act(() => {
          setError("foo", [{ a: "Required", b: "Required" }]);
          setTouched("foo[0].a", true, { shouldValidate: false });
          setTouched("foo[0].b", true, { shouldValidate: false });
          setDirty("foo[0].a");
          setDirty("foo[0].b");
          setShow(false);
        });
        await Promise.resolve();
        expect(getState()).toEqual({
          ...initialState,
          values: { foo: formValue },
          errors: { foo: [{ a: "Required", b: "Required" }] },
          isValid: false,
          touched: { foo: [{ a: true, b: true }] },
          dirty: { foo: [{ a: true, b: true }] },
          isDirty: true,
        });

        act(() => setShow(true));
        await waitFor(() => {
          expect(
            (screen.getByTestId("foo[0].a") as HTMLInputElement).value
          ).toBe(formValue[0].a);
          expect(
            (screen.getByTestId("foo[0].b") as HTMLInputElement).value
          ).toBe(formValue[0].b);
        });
      }
    );

    it.each([true, false])("should reset correctly", async (isShow) => {
      const defaultValues = { foo: isShow ? [{}] : formValue };
      const { getState, setShow, setValue, reset } = renderHelper({
        isShow: !isShow,
        defaultValues,
        children: ({ fields, show }: API) =>
          fields.map((name) => (
            <div key={name}>
              {show && (
                <input
                  data-testid={`${name}.a`}
                  name={`${name}.a`}
                  defaultValue={fieldValue[0].a}
                />
              )}
              {show && (
                <Field
                  data-testid={`${name}.b`}
                  name={`${name}.b`}
                  defaultValue={fieldValue[0].b}
                />
              )}
            </div>
          )),
      });
      act(() => {
        setShow(true);
        setValue("foo[0].a", "🥝");
        setValue("foo[0].b", "🥝");
        reset();
      });
      await waitFor(() =>
        expect(getState("foo")).toEqual(isShow ? fieldValue : formValue)
      );
      expect((screen.getByTestId("foo[0].a") as HTMLInputElement).value).toBe(
        isShow ? fieldValue[0].a : formValue[0].a
      );
      expect((screen.getByTestId("foo[0].b") as HTMLInputElement).value).toBe(
        isShow ? fieldValue[0].b : formValue[0].b
      );
    });
  });
});
