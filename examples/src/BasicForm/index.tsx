/* eslint-disable react/prop-types */
/** @jsx jsx */

import { jsx } from "@emotion/core";
import React, { memo, useState, forwardRef } from "react";
import useForm, { Errors } from "react-cool-form";

import { container, form, label as labelStyle, wrapper } from "./styles";

const Input = memo(
  forwardRef(
    ({ label, id, name, ...rest }: any, ref): JSX.Element => {
      // console.log(`LOG ==> ${name} is re-rendered`);

      return (
        <React.Fragment>
          <label css={labelStyle} htmlFor={id || name}>
            {label}
          </label>
          <input id={id || name} name={name} {...rest} ref={ref} />
        </React.Fragment>
      );
    }
  )
);

const Select = memo(
  forwardRef(
    ({ children, label, name, ...rest }: any, ref): JSX.Element => {
      // console.log(`LOG ==> ${name} is re-rendered`);

      return (
        <React.Fragment>
          <label css={labelStyle} htmlFor={name}>
            {label}
          </label>
          <select id={name} name={name} {...rest} ref={ref}>
            {children}
          </select>
        </React.Fragment>
      );
    }
  )
);

const TextArea = memo(
  forwardRef(
    ({ label, name, ...rest }: any, ref): JSX.Element => {
      // console.log(`LOG ==> ${name} is re-rendered`);

      return (
        <React.Fragment>
          <label css={labelStyle} htmlFor={name}>
            {label}
          </label>
          <textarea id={name} name={name} {...rest} ref={ref} />
        </React.Fragment>
      );
    }
  )
);

interface FormValues {
  text: Record<string, string>;
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
  text: { nest: "" },
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
  const {
    formRef,
    validate,
    formState,
    setFieldValue,
    setFieldError,
  } = useForm<FormValues>({
    defaultValues,
    // validateOnChange: false,
    // validateOnBlur: false,
    // @ts-ignore
    validate: async ({ text, hiddenText }) => {
      const errors = { text: { nest: "" } };

      // eslint-disable-next-line
      await new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });

      let count = 100000000;

      // eslint-disable-next-line no-plusplus
      while (count--) {
        // ...
      }

      errors.text.nest = `Form ${Math.random()}`;
      // if (text.nest.length <= 3) errors.text.nest = `Form ${Math.random()}`;
      // if (hiddenText.length <= 3) errors.hiddenText = "Form error";

      // throw new Error("Fake error");
      // return false;
      return { text: { nest: ["Form error"] } };
      // return errors;
    },
  });

  console.log("LOG ===> formState: ", formState.isValidating, formState.errors);

  const handleSetValueClick = (): void => {
    // setFieldValue("text.nest", (prevValue: string) => `new ${prevValue}`);
    // setFieldValue("text.nest", "new test");
    setFieldValue("hiddenText", "new test");
    // setFieldValue("password", "");
    // setFieldValue("number", 456);
    // setFieldValue("checkbox", false);
    // setFieldValue("checkboxGroup", ["value-2"]);
    // setFieldValue("radio", "value-2");
    // setFieldValue("multiSelect.nest", ["value-2"]);
  };

  const handleSetErrorsClick = (): void => {
    setFieldError("text.nest", "Required");
    setFieldError("hiddenText", (prevMsg) => `new ${prevMsg}`);
  };

  const handleClearErrorsClick = (): void => {
    setFieldError("text.nest");
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
        <Input
          label="Text:"
          name="text.nest"
          // @ts-ignore
          ref={validate(async (values) => {
            // eslint-disable-next-line
            // await new Promise((resolve) => setTimeout(resolve, 1000));
            // return `Field ${Math.random()}`;
            return values.length <= 3 ? ["Field error"] : false;
          })}
        />
        {showInput && (
          <div>
            <Input label="Hidden Text:" name="hiddenText" />
          </div>
        )}
        {/* <Input label="Password:" type="password" name="password" /> */}
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
        <button type="button" onClick={handleToggleInputClick}>
          Toggle Input
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
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};
