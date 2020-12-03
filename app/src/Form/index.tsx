/** @jsxImportSource @emotion/react */

import { useState, useEffect, useCallback } from "react";
import { useForm, get, set } from "react-cool-form";
import * as Yup from "yup";

import Input from "./Input";
import Controller from "./Controller";
import Select from "./Select";
import TextArea from "./TextArea";
import { container, form as formStyle, wrapper } from "./styles";

const fib = (n: number): number => (n < 3 ? 1 : fib(n - 2) + fib(n - 1));

export interface FormValues {
  hidden: string;
  text?: Record<string, string>;
  controller1?: any;
  controller2: any;
  dynamicText1?: string;
  dynamicText2: string;
  password: string;
  number: number;
  range: number;
  checkbox: boolean;
  checkboxGroup: string[];
  radio: string;
  image: any;
  select: string;
  multiSelect: Record<string, string[]>;
  textarea: string;
}

const defaultValues = {
  hidden: "new test",
  text: { nest: "new test" },
  controller1: "new test",
  controller2: "new test",
  dynamicText1: "new test",
  dynamicText2: "new test",
  password: "nest test",
  number: 5,
  range: 0,
  checkbox: true,
  checkboxGroup: ["value-1"],
  radio: "value-1",
  image: [],
  select: "value-2",
  multiSelect: { nest: ["value-1", "value-2"] },
  textarea: "test",
};

const schema = Yup.object().shape({
  text: Yup.object()
    .shape({
      nest: Yup.string().required(),
    })
    .required(),
  number: Yup.number().min(100).required(),
});

export default (): JSX.Element => {
  const [show1, setShow1] = useState(true);
  const [show2, setShow2] = useState(true);
  const {
    form,
    field,
    getState,
    setValues,
    setFieldValue,
    setErrors,
    setFieldError,
    validateField,
    validateForm,
    controller,
    reset,
    submit,
  } = useForm<FormValues>({
    defaultValues,
    // validateOnChange: false,
    // validateOnBlur: false,
    // ignoreFields: ["text.nest", "controller1"],
    // validate: async (values) => {
    //   let errors: any = { text: { nest: "" } };

    //   // fib(40);

    //   // eslint-disable-next-line
    //   await new Promise((resolve) => {
    //     setTimeout(resolve, 3000);
    //   });

    //   // if (text.nest.length <= 3) set(errors, "text.nest", "Form error");
    //   if (values.text.nest.length <= 5) {
    //     errors.text.nest = "Form error";
    //   } else {
    //     errors = {};
    //   }
    //   // if (hiddenText.length <= 3) errors.hiddenText = "Form error";

    //   // throw new Error("Fake error");
    //   return errors;

    //   /* try {
    //     await schema.validate(values, { abortEarly: false });
    //   } catch (error) {
    //     const formErrors = {};

    //     error.inner.forEach(({ path, message }: any) =>
    //       set(formErrors, path, message)
    //     );

    //     return formErrors;
    //   } */
    // },
    onReset: (values, options, e) =>
      console.log("LOG ===> onReset: ", values, options, e),
    onSubmit: async (values, options, e) => {
      // eslint-disable-next-line
      /* await new Promise((resolve) => {
        setTimeout(resolve, 3000);
      }); */

      console.log("LOG ===> onSubmit: ", values);
    },
    onError: (errors, options, e) =>
      console.log("LOG ===> onError: ", errors, options, e),
    // debug: (formState) => console.log("LOG ===> debug: ", formState),
  });

  // console.log("LOG ===> Re-render");
  /* console.log(
    "LOG ===> ",
    getState([
      "values.controller1",
      "errors.controller1",
      "dirtyFields.controller1",
    ])
  ); */
  // console.log("LOG ===> ", getState("values.dynamicText1"));
  console.log(
    "LOG ===> formState: ",
    getState({
      // values: "values",
      errors: "errors",
      // touched: "touched",
      // isDirty: "isDirty",
      // dirtyFields: "dirtyFields",
      // isValidating: "isValidating",
      // isValid: "isValid",
      // isSubmitting: "isSubmitting",
      // isSubmitted: "isSubmitted",
      // submitCount: "submitCount",
    })
  );
  const errors = getState("errors");

  useEffect(() => {
    // validateField("text.nest");
    // validateForm();
  }, []);

  const handleToggle1Click = (): void => setShow1(!show1);

  const handleToggle2Click = (): void => setShow2(!show2);

  const handleSetValueClick = (): void => {
    // setFieldValue("password", "123");

    setValues(
      (prevValues) => ({
        ...prevValues,
        password: "123",
      }),
      {
        touchedFields: ["password"],
        dirtyFields: ["password"],
      }
    );

    // setFieldValue("text.nest", (prevValue: string) => `new ${prevValue}`);
    // setFieldValue("text.nest", "new test");
    // setFieldValue("hiddenText", "new test");
    // setFieldValue("password", "");
    // setFieldValue("number", 456);
    // setFieldValue("checkbox", false);
    // setFieldValue("checkboxGroup", ["value-2"]);
    // setFieldValue("radio", "value-2");
    // setFieldValue("multiSelect.nest", ["value-2"]);
    // setFieldValue("password", "12345678");
  };

  const handleSetErrorsClick = (): void => {
    setFieldError("number", "Error");
    // setFieldError("text.nest", "Required");
    // setFieldError("hiddenText", (prevMsg) => `new ${prevMsg}`);
  };

  const handleClearErrorsClick = (): void => {
    setFieldError("password");
  };

  const handleValidateClick = (): void => {
    validateField("text.nest");
  };

  const handleResetClick = (): void => {
    /* reset((prevValues) => ({ ...prevValues, text: { nest: "test reset" } }), [
      "touched",
      "submitCount",
    ]); */

    reset();
  };

  const handleSubmit = async () => {
    const res = await submit();
    console.log("LOG ===> ", res);
  };

  return (
    <div css={container}>
      <form css={formStyle} noValidate ref={form}>
        <Input name="hidden" type="hidden" defaultValue="test" />
        <Input
          label="Text:"
          name="text.nest"
          ref={field(async (value) => {
            // eslint-disable-next-line
            // await new Promise((resolve) => setTimeout(resolve, 1000));
            return value.length <= 5 ? "Field error" : "";
          })}
          // data-rcf-ignore
          required
          defaultValue="test"
        />
        {errors.text?.nest && <p>{errors.text?.nest}</p>}
        <Input
          label="Controller 1:"
          {...controller("controller1", {
            defaultValue: "test",
            /* validate: async (val) => {
              return val.length <= 5 ? "Field error" : "";
            }, */
          })}
          // required
          // data-rcf-ignore
          // defaultChecked
        />
        <Controller
          label="Controller 2:"
          name="controller2"
          // eslint-disable-next-line react-hooks/exhaustive-deps
          controller={controller}
          /* validate={useCallback(async (val, values) => {
            // eslint-disable-next-line
            // await new Promise((resolve) => setTimeout(resolve, 1000));
            // console.log("LOG ===> validate: ", val, values);
            return val.length <= 5 ? "Field error" : "";
          }, [])} */
          // required
          defaultValue={defaultValues.controller2}
        />
        <div>
          <Input
            label="Dynamic Text 1:"
            name="dynamicText1"
            defaultValue="test"
          />
        </div>
        <div>
          <Input
            label="Dynamic Text 2:"
            name="dynamicText2"
            defaultValue="test"
          />
        </div>
        <Input
          label="Password:"
          type="password"
          name="password"
          required
          minLength={5}
          // defaultValue="test"
        />
        {errors.password && <p>{errors.password}</p>}
        <Input label="Number:" type="number" name="number" />
        <Input label="Range:" type="range" name="range" />
        <Input
          label="Checkbox:"
          type="checkbox"
          name="checkbox"
          // defaultChecked
        />
        <div css={wrapper}>
          <Input
            id="checkboxGroup-1"
            label="Checkbox 1:"
            type="checkbox"
            name="checkboxGroup"
            value="value-1"
            // defaultChecked
          />
          <Input
            id="checkboxGroup-2"
            label="Checkbox 2:"
            type="checkbox"
            name="checkboxGroup"
            value="value-2"
            // defaultChecked
          />
        </div>
        <div css={wrapper}>
          <Input
            id="radio-1"
            label="Radio 1:"
            type="radio"
            name="radio"
            value="value-1"
          />
          <Input
            id="radio-2"
            label="Radio 2:"
            type="radio"
            name="radio"
            value="value-2"
            // defaultChecked
          />
        </div>
        <Input label="File:" type="file" name="image" />
        <Select label="Select:" name="select">
          <option value="value-1">Value 1</option>
          <option value="value-2">Value 2</option>
        </Select>
        <Select
          label="Multi-select:"
          name="multiSelect.nest"
          multiple
          defaultValue={["value-1", "value-2"]}
        >
          <option value="value-1">Value 1</option>
          <option value="value-2">Value 2</option>
        </Select>
        <TextArea label="Text Area:" name="textarea" />
        <button type="button" onClick={handleToggle1Click}>
          Toggle 1
        </button>
        <button type="button" onClick={handleToggle2Click}>
          Toggle 2
        </button>
        <button type="button" onClick={handleSetValueClick}>
          Set Values
        </button>
        <button type="button" onClick={handleSetErrorsClick}>
          Set Errors
        </button>
        <button type="button" onClick={handleClearErrorsClick}>
          Clear Errors
        </button>
        <button type="button" onClick={handleValidateClick}>
          Validate
        </button>
        <button type="button" onClick={handleResetClick}>
          Reset
        </button>
        <button type="button" onClick={handleSubmit}>
          My Submit
        </button>
        <input type="submit" />
        <input type="reset" onClick={(e) => reset(null, null, e)} />
      </form>
    </div>
  );
};
