import React, { ChangeEvent, memo, useState } from "react";
import { Controller as ControllerType, Parser } from "react-cool-form";

import { FormValues } from ".";

import Input from "./Input";

interface Props {
  label: string;
  name: string;
  type?: string;
  controller: ControllerType<FormValues, ChangeEvent<HTMLInputElement>>;
}

const Controller = ({ label, name, type, controller }: Props) => {
  // console.log(`LOG ==> ${name} is re-rendered`);

  const [value, setValue] = useState("");
  const parser: Parser<ChangeEvent<HTMLInputElement>> = (e) =>
    e.target.value.length % 2 ? "case 1" : "case 2";

  return (
    <Input
      label={label}
      type={type}
      {...controller(name, {
        validate: async (val, values) => {
          // console.log("LOG ===> validate: ", val, formState);
          // eslint-disable-next-line
          // await new Promise((resolve) => setTimeout(resolve, 1000));
          return val.length <= 3 ? "Field error" : "";
        },
        // value,
        // parser,
        onChange: (e, val) => {
          // setValue(val);
          // console.log("LOG ===> onChange: ", val);
        },
        onBlur: (e) => {
          // console.log("LOG ===> onBlur: ", e);
        },
      })}
      // ref={validate(async (values) => {
      //   // eslint-disable-next-line
      //   // await new Promise((resolve) => setTimeout(resolve, 1000));
      //   return values.length <= 3 ? "Field error" : "";
      // })}
    />
  );
};

Controller.defaultProps = {
  type: undefined,
};

export default memo(Controller);
