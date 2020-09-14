/** @jsx jsx */

import { jsx } from "@emotion/core";
import React, { memo } from "react";
import useForm from "react-cool-form";

import { container, form } from "./styles";

const TextField = memo(
  ({ label, name, ...rest }: any): JSX.Element => {
    console.log(`${name} is re-rendered`);

    return (
      <React.Fragment>
        <label htmlFor={name}>{label}</label>
        <input id={name} {...rest} />
      </React.Fragment>
    );
  }
);

export default (): JSX.Element => {
  // @ts-ignore
  const { getInputProps } = useForm({
    defaultValues: { firstName: "", lastName: "" },
  });

  const handleSubmit = (e: any): void => {
    e.preventDefault();
    console.log("LOG ===> ", e);
  };

  return (
    <div css={container}>
      <form css={form} onSubmit={handleSubmit} noValidate>
        <TextField
          label="First Name: "
          type="text"
          {...getInputProps("firstName")}
        />
        <TextField
          label="Last Name: "
          type="text"
          {...getInputProps("lastName")}
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};
