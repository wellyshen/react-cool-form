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

interface FormProps {
  text: string;
  checkbox: boolean;
  checkboxGroup: string[];
  radio: string;
  select: string;
}

const defaultValues = {
  text: "",
  checkbox: false,
  checkboxGroup: [],
  radio: "",
  select: "",
};

export default (): JSX.Element => {
  // @ts-expect-error
  const { formRef, values } = useForm<FormProps>({ defaultValues });

  console.log("LOG ==> Values: ", values);

  return (
    <div css={container}>
      <form css={form} noValidate ref={formRef}>
        <Input label="Text:" name="text" />
        <Input label="Checkbox:" type="checkbox" name="checkbox" />
        <div css={wrapper}>
          <Input
            label="Checkbox 1:"
            type="checkbox"
            name="checkboxGroup"
            value="val-1"
          />
          <Input
            label="Checkbox 2:"
            type="checkbox"
            name="checkboxGroup"
            value="val-2"
          />
        </div>
        <div css={wrapper}>
          <Input label="Radio 1:" type="radio" name="radio" value="val-1" />
          <Input label="Radio 2:" type="radio" name="radio" value="val-2" />
        </div>
        <Select label="Select:" name="select">
          <option value="val-1">Value 1</option>
          <option value="val-2">Value 2</option>
          <option value="val-3">Value 3</option>
        </Select>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};
