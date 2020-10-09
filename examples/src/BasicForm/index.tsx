/** @jsx jsx */

import { jsx } from "@emotion/core";
import React, { memo, useState, useRef } from "react";
import useForm, { Errors } from "react-cool-form";

import { container, form, label as labelStyle, wrapper } from "./styles";

const Input = memo(
  ({ label, id, name, ...rest }: any): JSX.Element => {
    // console.log(`LOG ==> ${name} is re-rendered`);

    return (
      <React.Fragment>
        <label css={labelStyle} htmlFor={id || name}>
          {label}
        </label>
        <input id={id || name} name={name} {...rest} />
      </React.Fragment>
    );
  }
);

const Select = ({ children, label, name, ...rest }: any): JSX.Element => (
  <React.Fragment>
    <label css={labelStyle} htmlFor={name}>
      {label}
    </label>
    <select id={name} name={name} {...rest}>
      {children}
    </select>
  </React.Fragment>
);

const TextArea = memo(
  ({ label, name, ...rest }: any): JSX.Element => {
    // console.log(`LOG ==> ${name} is re-rendered`);

    return (
      <React.Fragment>
        <label css={labelStyle} htmlFor={name}>
          {label}
        </label>
        <textarea id={name} name={name} {...rest} />
      </React.Fragment>
    );
  }
);

interface FormValues {
  text: string;
  hiddenText: string;
  password: string;
  number: number;
  checkbox: boolean;
  checkboxGroup: string[];
  radio: string;
  image: any;
  select: string;
  multiSelect: Record<string, string[]>;
  textarea: string;
}

const defaultValues = {
  text: "test",
  hiddenText: "test",
  password: "test",
  number: 123,
  checkbox: true,
  checkboxGroup: ["value-1"],
  radio: "value-1",
  image: "",
  select: "value-2",
  multiSelect: { nest: ["value-1", "value-2"] },
  textarea: "test",
};

export default (): JSX.Element => {
  const [showInput, setShowInput] = useState(false);
  // const formRef = useRef(null);
  const { formRef, formState, setFieldValue, setFieldError } = useForm<
    FormValues
  >({
    // formRef,
    defaultValues,
    // validateOnChange: false,
    // validateOnBlur: false,
    validate: async (values, setError) => {
      const errors: Errors = {};

      // eslint-disable-next-line
      await new Promise((resolve) => {
        setTimeout(resolve, 5000);
      });

      setError("text.nest", "Required");

      // return errors;
    },
  });

  console.log("LOG ===> formState: ", formState.errors);

  const handleSetValueClick = (): void => {
    setFieldValue("text", (prevValue: string) => `new ${prevValue}`);
    // setFieldValue("text", "new test");
    setFieldValue("hiddenText", "new test");
    setFieldValue("password", "");
    setFieldValue("number", 456);
    setFieldValue("checkbox", false);
    setFieldValue("checkboxGroup", ["value-2"]);
    setFieldValue("radio", "value-2");
    setFieldValue("multiSelect.nest", ["value-2"]);
  };

  const handleSetErrorsClick = (): void => {
    setFieldError("text", "Required");
    setFieldError("hiddenText", (prevError) => `new ${prevError}`);
  };

  const handleToggleInputClick = (): void => setShowInput(!showInput);

  return (
    <div css={container}>
      <form
        css={form}
        onSubmit={(e): void => e.preventDefault()}
        noValidate
        ref={formRef}
      >
        <Input label="Text:" name="text" />
        {showInput && <Input label="Hidden Text:" name="hiddenText" />}
        <Input label="Password:" type="password" name="password" />
        <Input label="Number:" type="number" name="number" />
        <Input label="Checkbox:" type="checkbox" name="checkbox" />
        <div css={wrapper}>
          <Input
            id="checkboxGroup-1"
            label="Checkbox 1:"
            type="checkbox"
            name="checkboxGroup"
            value="value-1"
          />
          <Input
            id="checkboxGroup-2"
            label="Checkbox 2:"
            type="checkbox"
            name="checkboxGroup"
            value="value-2"
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
          />
        </div>
        <Input label="File:" type="file" name="image" />
        <Select label="Select:" name="select">
          <option value="value-1">Value 1</option>
          <option value="value-2">Value 2</option>
        </Select>
        <Select label="Multi-select:" name="multiSelect.nest" multiple>
          <option value="value-1">Value 1</option>
          <option value="value-2">Value 2</option>
        </Select>
        <TextArea label="Text Area:" name="textarea" />
        <button type="button" onClick={handleSetValueClick}>
          Set Values
        </button>
        <button type="button" onClick={handleSetErrorsClick}>
          Set Errors
        </button>
        <button type="button" onClick={handleToggleInputClick}>
          Toggle Input
        </button>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};
