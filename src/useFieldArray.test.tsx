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

interface API {
  fields: string[];
  insert: Insert;
  move: Move;
  push: Push;
  remove: Remove;
  swap: Swap;
  setValue: SetValue;
  reset: Reset;
  getState: GetState;
}

interface Config extends FieldArrayConfig {
  children: (api: API) => JSX.Element[] | null;
  name: string;
  defaultValues: any;
  onSubmit: (values: any) => void;
  onError: (errors: any) => void;
  onReset: (values: any) => void;
  onRender: () => void;
}

type Props = Partial<Config>;

const Form = ({
  children,
  formId,
  name = "foo",
  defaultValues,
  onSubmit = () => null,
  onError = () => null,
  onReset = () => null,
  onRender = () => null,
  ...rest
}: Props) => {
  const { form, setValue, reset, getState } = useForm({
    id: formId,
    defaultValues,
    onSubmit: (values) => onSubmit(values),
    onError: (errors) => onError(errors),
    onReset: (values) => onReset(values),
  });
  // @ts-expect-error
  const [fields, helpers] = useFieldArray(name, { ...rest, formId }, formId);

  onRender();

  return (
    <form data-testid="form" ref={form}>
      {children
        ? children({ setValue, reset, getState, fields, ...helpers })
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

describe("useFieldArray", () => {
  const getByTestId = screen.getByTestId as any;
  const onSubmit = jest.fn();
  const onRender = jest.fn();
  const value = [{ name: "🍎" }];

  beforeEach(() => jest.clearAllMocks());

  it("should throw missing name error", () => {
    // @ts-expect-error
    expect(() => useFieldArray()).toThrow(
      '💡 react-cool-form > useFieldArray: Missing "name" parameter.'
    );
  });

  it("should throw form id errors", () => {
    expect(() => useFieldArray("values", { formId: "form-1" })).toThrow(
      '💡 react-cool-form > useFieldArray: You must provide the corresponding ID to "useForm" hook. See: https://react-cool-form.netlify.app/docs/api-reference/use-form#id'
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
          fields.map((fieldName) => (
            <input
              data-testid={fieldName}
              key={fieldName}
              name={`${fieldName}.name`}
            />
          )),
      });
      expect(container.querySelectorAll("input")).toHaveLength(1);
      expect(getByTestId("foo[0]").value).toBe(value[0].name);
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
      defaultValue: [{ name: "🍋" }],
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
          fields.map((fieldName) => (
            <input
              data-testid={fieldName}
              key={fieldName}
              name={`${fieldName}.name`}
            />
          )),
      });
      const newValue = { name: "🍋" };
      act(() => push(newValue, options));
      expect(container.querySelectorAll("input")).toHaveLength(2);
      await waitFor(() =>
        expect(getByTestId("foo[1]").value).toBe(newValue.name)
      );
      expect(getState("foo")).toEqual([...value, newValue]);
      if (options?.shouldDirty === false) {
        expect(getState("dirty.foo")).toBeUndefined();
      } else {
        expect(getState("dirty.foo")).toEqual([, { name: true }]);
      }
      if (options?.shouldTouched) {
        expect(getState("touched.foo")).toEqual([, { name: true }]);
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
        fields.map((fieldName) => (
          <input
            data-testid={fieldName}
            key={fieldName}
            name={`${fieldName}.name`}
          />
        )),
    });

    let val = [...value, { name: "🍋" }];
    act(() => insert(1, val[1], { shouldTouched: true }));
    expect(container.querySelectorAll("input")).toHaveLength(2);
    await waitFor(() => expect(getByTestId("foo[1]").value).toBe(val[1].name));
    expect(getState("foo")).toEqual(val);
    expect(getState("dirty.foo")).toEqual([, { name: true }]);
    expect(getState("touched.foo")).toEqual([, { name: true }]);
    expect(onRender).toHaveBeenCalledTimes(2);

    val = [...val, { name: "🥝" }];
    act(() => insert(2, val[2], { shouldDirty: false }));
    expect(container.querySelectorAll("input")).toHaveLength(3);
    await waitFor(() => expect(getByTestId("foo[2]").value).toBe(val[2].name));
    expect(getState("foo")).toEqual(val);
    expect(getState("dirty.foo")).toEqual([, { name: true }]);
    expect(getState("touched.foo")).toEqual([, { name: true }]);

    val = [{ name: "🍒" }, ...val];
    act(() => insert(0, val[0], { shouldDirty: false }));
    expect(container.querySelectorAll("input")).toHaveLength(4);
    await waitFor(() => expect(getByTestId("foo[0]").value).toBe(val[0].name));
    expect(getState("foo")).toEqual(val);
    expect(getState("dirty.foo")).toEqual([, , { name: true }]);
    expect(getState("touched.foo")).toEqual([, , { name: true }]);
  });

  it.each(["swap", "move"])("should %s values correctly", (type) => {
    const { push, swap, move, getState } = renderHelper({
      defaultValues: { foo: value },
      onRender,
      children: ({ fields }: API) =>
        fields.map((fieldName) => (
          <input
            data-testid={fieldName}
            key={fieldName}
            name={`${fieldName}.name`}
          />
        )),
    });
    const newValue = { name: "🍋" };
    act(() => {
      push(newValue, { shouldTouched: true });
      if (type === "swap") {
        swap(0, 1);
      } else {
        move(1, 0);
      }
    });
    expect(getState("foo")).toEqual([newValue, ...value]);
    expect(getState("touched.foo")).toEqual([{ name: true }, undefined]);
    expect(getState("dirty.foo")).toEqual([{ name: true }, undefined]);
    expect(onRender).toHaveBeenCalledTimes(2);
  });
});
