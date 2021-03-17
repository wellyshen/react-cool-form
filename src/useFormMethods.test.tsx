import { render } from "@testing-library/react";

import { FormMethods } from "./types";
import useForm from "./useForm";
import useFormMethods from "./useFormMethods";

interface Props {
  children: (methods: FormMethods) => JSX.Element | null;
}

const Form = ({ children }: Props) => {
  const { form } = useForm();
  const methods = useFormMethods();

  return <form ref={form}>{children(methods)}</form>;
};

const renderHelper = () => {
  let api: FormMethods;

  render(
    <Form>
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
      '💡 react-cool-form > useFormMethods: You must provide the corresponding ID to "useForm" hook. See: https://react-cool-form.netlify.app/docs/api-reference/use-form#id'
    );
  });

  it("should return methods correctly", () => {
    const methods = renderHelper();
    expect(methods).toEqual({
      form: expect.any(Function),
      field: expect.any(Function),
      watch: expect.any(Function),
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
