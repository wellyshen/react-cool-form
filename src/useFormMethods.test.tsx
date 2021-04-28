import { render } from "@testing-library/react";

import { FormMethods } from "./types";
import useForm from "./useForm";
import useFormMethods from "./useFormMethods";

interface Props {
  children: (methods: FormMethods) => JSX.Element | null;
  formId?: string;
}

const Form = ({ children, formId }: Props) => {
  const { form } = useForm({ id: formId });
  const methods = useFormMethods(formId);

  return <form ref={form}>{children(methods)}</form>;
};

const renderHelper = (formId?: string) => {
  let api: FormMethods;

  render(
    <Form formId={formId}>
      {(methods) => {
        api = methods;
        return null;
      }}
    </Form>
  );

  // @ts-expect-error
  return api;
};

describe("useFormMethods", () => {
  it("should throw form id errors", () => {
    expect(() => useFormMethods("form-1")).toThrow(
      '💡 react-cool-form > useFormMethods: It must work with an "useForm" hook. See: https://react-cool-form.netlify.app/docs/api-reference/use-form'
    );
  });

  it.each([undefined, "form-1"])(
    "should return methods correctly",
    (formId) => {
      const methods = renderHelper(formId);
      expect(methods).toEqual({
        form: expect.any(Function),
        field: expect.any(Function),
        focus: expect.any(Function),
        removeField: expect.any(Function),
        watchState: expect.any(Function),
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
    }
  );
});
