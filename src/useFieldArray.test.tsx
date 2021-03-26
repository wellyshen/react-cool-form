import { render, fireEvent, screen, waitFor } from "@testing-library/react";

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
  const fieldValue = [{ name: "🍎" }];

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
        defaultValues: type === "form" ? { foo: fieldValue } : undefined,
        defaultValue: type === "field-array" ? fieldValue : undefined,
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
      expect(getByTestId("foo[0]").value).toBe(fieldValue[0].name);
      fireEvent.submit(getByTestId("form"));
      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith({ foo: fieldValue })
      );
    }
  );

  it("should use form-level default value first", async () => {
    const defaultValues = { foo: fieldValue };
    renderHelper({
      defaultValues,
      defaultValue: [{ name: "🍋" }],
      onSubmit,
    });
    fireEvent.submit(getByTestId("form"));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(defaultValues));
  });
});
