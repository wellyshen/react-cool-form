import { render } from "@testing-library/react";

import { Path } from "./types";
import useForm from "./useForm";
import useFormState from "./useFormState";

interface Props {
  children: (state: any) => JSX.Element;
  path?: Path;
  id?: string;
  formId?: string;
}

const Form = ({ children, path, id, formId }: Props) => {
  const { form } = useForm({ id });
  // @ts-expect-error
  const state = useFormState(path, { formId: formId || id || "" });

  return <form ref={form}>{children(state)}</form>;
};

const renderHelper = ({ ...rest }: Omit<Props, "children"> = {}) => {
  let state;

  render(
    <Form {...rest}>
      {(s) => {
        state = s;
        return <input data-testid="foo" name="foo" required />;
      }}
    </Form>
  );

  return state;
};

describe("useFormState", () => {
  it("should warn missing form id", () => {
    console.warn = jest.fn();
    renderHelper();
    expect(console.warn).toHaveBeenCalledWith(
      '💡 react-cool-form > useFormState: Missing the "formId" option. See: TBD'
    );

    console.warn = jest.fn();
    renderHelper({ formId: "form-1" });
    expect(console.warn).toHaveBeenCalledWith(
      "💡 react-cool-form > useFormState: You must provide the corresponding ID to the form. See: TBD"
    );

    console.warn = jest.fn();
    renderHelper({ id: "form-1" });
    expect(console.warn).not.toHaveBeenCalled();
  });

  it("should...", () => {
    // ...
  });
});
