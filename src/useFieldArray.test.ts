import useFieldArray from "./useFieldArray";

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
