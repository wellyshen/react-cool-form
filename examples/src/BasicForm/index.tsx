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
        <input id={name} {...rest} />
      </React.Fragment>
    );
  }
);

export default (): JSX.Element => {
  const defaultValues = { txt1: "", txt2: "" };
  // @ts-ignore
  const { getFieldProps, formState } = useForm({ defaultValues });

  console.log("LOG ==> formState: ", formState);

  const handleSubmit = (e: any): void => {
    e.preventDefault();
  };

  return (
    <div css={container}>
      <form css={form} onSubmit={handleSubmit} noValidate>
        <Input label="Text:" />
        <Input label="Checkbox:" type="checkbox" />
        <div css={wrapper}>
          <Input
            label="Checkbox Group 1:"
            type="checkbox"
            value="checkboxGroup"
          />
          <Input
            label="Checkbox Group 2:"
            type="checkbox"
            value="checkboxGroup"
          />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};
