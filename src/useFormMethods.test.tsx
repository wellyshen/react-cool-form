import { render } from "@testing-library/react";

import { FormReturn } from "./types";
import useForm from "./useForm";
import useFormMethods from "./useFormMethods";

interface Props {
  children: (methods: FormReturn<any>) => JSX.Element | null;
}

const Form = ({ children }: Props) => {
  const { form } = useForm({ id: "form-1" });
  const methods = useFormMethods("form-1");

  return <form ref={form}>{children(methods)}</form>;
};

const renderHelper = () => {
  let methods: FormReturn<any>;

  render(
    <Form>
      {(m) => {
        methods = m;
        return null;
      }}
    </Form>
  );

  // @ts-expect-error
  return methods;
};

describe("useFormMethods", () => {
  it("should throw form id errors", () => {
    // @ts-expect-error
    expect(() => useFormMethods()).toThrow(
      '💡 react-cool-form > useFormMethods: Missing the "formId" option. See: https://react-cool-form.netlify.app/docs/api-reference/use-form-methods#formid'
    );

    expect(() => useFormMethods("form-1")).toThrow(
      '💡 react-cool-form > useFormMethods: You must provide the corresponding ID to the "useForm" hook. See: https://react-cool-form.netlify.app/docs/api-reference/use-form#id'
    );
  });

  it("should return methods correctly", () => {
    const methods = renderHelper();
    expect(methods).toEqual({
      form: expect.any(Function),
      field: expect.any(Function),
      select: expect.any(Function),
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
});
