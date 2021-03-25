import { render } from "@testing-library/react";

import { FieldArrayConfig, SetValue, Reset } from "./types";
import useForm from "./useForm";
import useFieldArray from "./useFieldArray";

interface API {
  setValue: SetValue;
  reset: Reset;
}

interface Config extends FieldArrayConfig {
  children: (api: API) => JSX.Element | null;
  name: string;
  defaultValues: any[];
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
  const { form, setValue, reset } = useForm({
    id: formId,
    defaultValues,
    onSubmit: (values) => onSubmit(values),
    onError: (errors) => onError(errors),
    onReset: (values) => onReset(values),
  });
  // @ts-expect-error
  const props = useFieldArray(name, { ...rest, formId }, formId);

  onRender();

  return (
    <form ref={form}>
      {children ? children({ setValue, reset, ...props }) : null}
    </form>
  );
};

// @ts-ignore
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

describe("useFieldArray", () => {
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
});
