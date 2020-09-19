/** @jsx jsx */

import { jsx } from "@emotion/core";
import React, { memo } from "react";
import useForm from "react-cool-form";

import { container, form, label as labelStyle, wrapper } from "./styles";

const Input = memo(
  ({ label, id, name, ...rest }: any): JSX.Element => {
    console.log(`LOG ==> ${name} is re-rendered`);

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
  ({ label, id, name, ...rest }: any): JSX.Element => {
    console.log(`LOG ==> ${name} is re-rendered`);

    return (
      <React.Fragment>
        <label css={labelStyle} htmlFor={id || name}>
          {label}
        </label>
        <textarea id={id || name} name={name} {...rest} />
      </React.Fragment>
    );
  }
);

interface FormProps {
  text: string;
  password: string;
  number: string;
  checkbox: boolean;
  checkboxGroup: string[];
  radio: string;
  file: FileList;
  select: string;
  multiSelect: string[];
  textarea: string;
}

const defaultValues = {
  text: "test",
  password: "",
  number: "",
  checkbox: false,
  checkboxGroup: [],
  radio: "",
  select: "",
  multiSelect: [],
  textarea: "",
};

export default (): JSX.Element => {
  // @ts-expect-error
  const { formRef, values } = useForm<FormProps>({ defaultValues });

  console.log("LOG ==> values: ", values);

  return (
    <div css={container}>
      <form
        css={form}
        onSubmit={(e) => e.preventDefault()}
        noValidate
        ref={formRef}
      >
        <Input label="Text:" name="text" />
        <Input label="Password:" type="password" name="password" />
        <Input label="Number:" type="number" name="number" />
        <Input label="Checkbox:" type="checkbox" name="checkbox" />
        <div css={wrapper}>
          <Input
            id="checkbox-group-1"
            label="Checkbox 1:"
            type="checkbox"
            name="checkboxGroup"
            value="val-1"
          />
          <Input
            id="checkbox-group-2"
            label="Checkbox 2:"
            type="checkbox"
            name="checkboxGroup"
            value="val-2"
          />
        </div>
        <div css={wrapper}>
          <Input
            id="radio-1"
            label="Radio 1:"
            type="radio"
            name="radio"
            value="val-1"
          />
          <Input
            id="radio-2"
            label="Radio 2:"
            type="radio"
            name="radio"
            value="val-2"
          />
          <Input label="File:" type="file" name="file" />
        </div>
        <Select label="Select:" name="select">
          <option value="val-1">Value 1</option>
          <option value="val-2">Value 2</option>
          <option value="val-3">Value 3</option>
        </Select>
        <Select label="Multi-select:" name="multiSelect" multiple>
          <option value="val-1">Value 1</option>
          <option value="val-2">Value 2</option>
          <option value="val-3">Value 3</option>
        </Select>
        <TextArea label="Text Area:" name="textarea" />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};
