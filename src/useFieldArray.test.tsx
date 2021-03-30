import {
  render,
  fireEvent,
  screen,
  act,
  waitFor,
} from "@testing-library/react";

import {
  FieldArrayConfig,
  GetState,
  SetValue,
  Insert,
  Move,
  Push,
  Remove,
  Reset,
  Swap,
} from "./types";
import useForm from "./useForm";
import useFieldArray from "./useFieldArray";
import useControlled from "./useControlled";

interface API {
  fields: string[];
  insert: Insert;
  move: Move;
  push: Push;
  remove: Remove;
  swap: Swap;
  getState: GetState;
  setValue: SetValue;
  reset: Reset;
}

interface Config extends FieldArrayConfig {
  children: (api: API) => JSX.Element[] | null;
  defaultValues: any;
  formValidate: (values: any) => void;
  onSubmit: (values: any) => void;
  onRender: () => void;
}

type Props = Partial<Config>;

const Form = ({
  children,
  formId,
  defaultValues,
  formValidate,
  onSubmit = () => null,
  onRender = () => null,
  ...rest
}: Props) => {
  const { form, getState, setValue, reset } = useForm({
    id: formId,
    defaultValues,
    validate: formValidate,
    onSubmit: (values) => onSubmit(values),
  });
  // @ts-expect-error
  const [fields, helpers] = useFieldArray("foo", { ...rest, formId }, formId);

  onRender();

  return (
    <form data-testid="form" ref={form}>
      {children
        ? children({ getState, setValue, reset, fields, ...helpers })
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

describe("useFieldArray", () => {
  const getByTestId = screen.getByTestId as any;
  const onSubmit = jest.fn();
  const onRender = jest.fn();
  const value = [{ a: "🍎", b: "🍎" }];

  beforeEach(() => jest.clearAllMocks());

  it("should throw missing name error", () => {
    // @ts-expect-error
    expect(() => useFieldArray()).toThrow(
      '💡 react-cool-form > useFieldArray: Missing "name" parameter.'
    );
  });

  it("should throw form id errors", () => {
    expect(() => useFieldArray("values", { formId: "form-1" })).toThrow(
      '💡 react-cool-form > useFieldArray: It must work with an "useForm" hook. See: https://react-cool-form.netlify.app/docs/api-reference/use-form'
    );
  });

  it.each(["form", "field-array"])(
    "should set default value correctly from %s option",
    async (type) => {
      const { container } = renderHelper({
        defaultValues: type === "form" ? { foo: value } : undefined,
        defaultValue: type === "field-array" ? value : undefined,
        onSubmit,
        children: ({ fields }: API) =>
          fields.map((name) => (
            <div key={name}>
              <input data-testid={`${name}.a`} name={`${name}.a`} />
              <Field data-testid={`${name}.b`} name={`${name}.b`} />
            </div>
          )),
      });
      expect(container.querySelectorAll("input")).toHaveLength(2);
      expect(getByTestId("foo[0].a").value).toBe(value[0].a);
      expect(getByTestId("foo[0].b").value).toBe(value[0].b);
      fireEvent.submit(getByTestId("form"));
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
    fireEvent.submit(getByTestId("form"));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(defaultValues));
  });

  it.each([undefined, true, value])(
    'should return "fields" correctly',
    (val) => {
      const { fields, getState } = renderHelper({
        defaultValues: { foo: val },
      });
      if (Array.isArray(val)) {
        expect(fields).toEqual(["foo[0]"]);
      } else {
        expect(fields).toEqual([]);
      }
      expect(getState("foo")).toEqual(val);
    }
  );

  it.each([{ shouldDirty: false }, { shouldTouched: true }])(
    "should push value correctly",
    async (options) => {
      const { push, container, getState } = renderHelper({
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
      const newValue = { a: "🍋", b: "🍋" };
      act(() => push(newValue, options));
      expect(container.querySelectorAll("input")).toHaveLength(4);
      await waitFor(() => {
        expect(getByTestId("foo[1].a").value).toBe(newValue.a);
        expect(getByTestId("foo[1].b").value).toBe(newValue.b);
      });
      expect(getState("foo")).toEqual([...value, newValue]);
      if (options?.shouldDirty === false) {
        expect(getState("dirty.foo")).toBeUndefined();
      } else {
        expect(getState("dirty.foo")).toEqual([, { a: true, b: true }]);
      }
      if (options?.shouldTouched) {
        expect(getState("touched.foo")).toEqual([, { a: true, b: true }]);
      } else {
        expect(getState("touched.foo")).toBeUndefined();
      }
      expect(onRender).toHaveBeenCalledTimes(2);
    }
  );

  it("should insert value correctly", async () => {
    const { insert, container, getState } = renderHelper({
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
    expect(container.querySelectorAll("input")).toHaveLength(4);
    await waitFor(() => {
      expect(getByTestId("foo[1].a").value).toBe(val[1].a);
      expect(getByTestId("foo[1].b").value).toBe(val[1].b);
    });
    expect(getState("foo")).toEqual(val);
    expect(getState("dirty.foo")).toEqual([, { a: true, b: true }]);
    expect(getState("touched.foo")).toEqual([, { a: true, b: true }]);
    expect(onRender).toHaveBeenCalledTimes(2);

    val = [...val, { a: "🥝", b: "🥝" }];
    act(() => insert(2, val[2], { shouldDirty: false }));
    expect(container.querySelectorAll("input")).toHaveLength(6);
    await waitFor(() => {
      expect(getByTestId("foo[2].a").value).toBe(val[2].a);
      expect(getByTestId("foo[2].b").value).toBe(val[2].b);
    });
    expect(getState("foo")).toEqual(val);
    expect(getState("dirty.foo")).toEqual([, { a: true, b: true }]);
    expect(getState("touched.foo")).toEqual([, { a: true, b: true }]);

    val = [{ a: "🍒", b: "🍒" }, ...val];
    act(() => insert(0, val[0], { shouldDirty: false }));
    expect(container.querySelectorAll("input")).toHaveLength(8);
    await waitFor(() => {
      expect(getByTestId("foo[0].a").value).toBe(val[0].a);
      expect(getByTestId("foo[0].b").value).toBe(val[0].b);
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
            <input data-testid={`${name}.a`} name={`${name}.a`} />
            <Field data-testid={`${name}.b`} name={`${name}.b`} />
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

  it.each(["set-value", "reset"])("should set value correctly", (type) => {
    const defaultValue = [...value, { a: "🍋", b: "🍋" }];
    const { setValue, reset, getState, push, remove, container } = renderHelper(
      {
        defaultValues: { foo: defaultValue },
        children: ({ fields }: API) =>
          fields.map((name) => (
            <div key={name}>
              <input data-testid={`${name}.a`} name={`${name}.a`} />
              <Field data-testid={`${name}.b`} name={`${name}.b`} />
            </div>
          )),
      }
    );
    const fooA = getByTestId("foo[0].a");
    const fooB = getByTestId("foo[0].b");
    const target = { value: "🍒" };

    fireEvent.input(fooA, { target });
    fireEvent.input(fooB, { target });
    act(() => {
      if (type === "set-value") {
        setValue("foo", defaultValue);
      } else {
        reset();
      }
    });
    expect(fooA.value).toBe(defaultValue[0].a);
    expect(fooB.value).toBe(defaultValue[0].b);
    expect(getState("foo")).toEqual(defaultValue);
    if (type === "reset") {
      expect(getState("touched.foo")).toBeUndefined();
      expect(getState("dirty.foo")).toBeUndefined();
    }

    act(() => {
      if (type === "set-value") reset();
      push({ a: "🥝", b: "🥝" });
    });
    fireEvent.input(fooA, { target });
    fireEvent.input(fooB, { target });
    act(() => {
      if (type === "set-value") {
        setValue("foo", defaultValue);
      } else {
        reset();
      }
    });
    expect(container.querySelectorAll("input")).toHaveLength(4);
    expect(fooA.value).toBe(defaultValue[0].a);
    expect(fooB.value).toBe(defaultValue[0].b);
    expect(getState("foo")).toEqual(defaultValue);
    if (type === "reset") {
      expect(getState("touched.foo")).toBeUndefined();
      expect(getState("dirty.foo")).toBeUndefined();
    }

    act(() => {
      if (type === "set-value") reset();
      remove(1);
    });
    fireEvent.input(fooA, { target });
    fireEvent.input(fooB, { target });
    act(() => {
      if (type === "set-value") {
        setValue("foo", defaultValue);
      } else {
        reset();
      }
    });
    expect(container.querySelectorAll("input")).toHaveLength(4);
    expect(fooA.value).toBe(defaultValue[0].a);
    expect(fooB.value).toBe(defaultValue[0].b);
    expect(getState("foo")).toEqual(defaultValue);
    if (type === "reset") {
      expect(getState("touched.foo")).toBeUndefined();
      expect(getState("dirty.foo")).toBeUndefined();
    }
  });

  it.each(["form", "field"])("should run %s-level validation", async (type) => {
    const error = "Required";
    const { remove, getState } = renderHelper({
      defaultValues: { foo: value },
      formValidate:
        type === "form"
          ? ({ foo }) => (!foo.length ? { foo: error } : {})
          : undefined,
      validate:
        type === "field" ? (val) => (!val.length ? error : false) : undefined,
    });
    act(() => {
      remove(0);
    });
    await waitFor(() => expect(getState("errors.foo")).toBe(error));
  });
});
