/** @jsx jsx */

import { jsx } from "@emotion/core";
import React, { memo } from "react";
import useForm from "react-cool-form";

import { container, form, label as labelStyle, wrapper } from "./styles";

const Input = memo(
  ({ label, name, ...rest }: any): JSX.Element => {
    console.log(`LOG ==> ${name} is re-rendered`);

    return (
      <React.Fragment>
        <label css={labelStyle} htmlFor={name}>
          {label}
        </label>
        <input id={name} name={name} {...rest} />
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
    console.log(`LOG ==> ${name} is re-rendered`);

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
  password: "test",
  number: "123",
  checkbox: true,
  checkboxGroup: ["value-1"],
  radio: "value-2",
  select: "value-2",
  multiSelect: ["value-1", "value-2"],
  textarea: "test",
};

export default (): JSX.Element => {
  // @ts-expect-error
  const { formRef, values } = useForm<FormProps>({ defaultValues });

  console.log("LOG ==> values: ", values);

  return (
    <div css={container}>
      <form
        css={form}
        onSubmit={(e): void => e.preventDefault()}
        noValidate
        ref={formRef}
      >
        <Input label="Text:" name="text" defaultValue="default value" />
        <Input label="Password:" type="password" name="password" />
        <Input label="Number:" type="number" name="number" />
        <Input
          label="Checkbox:"
          type="checkbox"
          name="checkbox"
          defaultChecked
        />
        <div css={wrapper}>
          <Input
            label="Checkbox 1:"
            type="checkbox"
            name="checkboxGroup1"
            value="value-1"
          />
          <Input
            label="Checkbox 2:"
            type="checkbox"
            name="checkboxGroup2"
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
        <Input label="File:" type="file" name="file" />
        <Select label="Select:" name="select">
          <option value="value-1">Value 1</option>
          <option value="value-2">Value 2</option>
        </Select>
        <Select label="Multi-select:" name="multiSelect" multiple>
          <option value="value-1">Value 1</option>
          <option value="value-2">Value 2</option>
        </Select>
        <TextArea label="Text Area:" name="textarea" />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};
