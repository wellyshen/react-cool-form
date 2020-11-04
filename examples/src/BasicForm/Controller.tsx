import React, { ChangeEvent, memo, useState } from "react";
import { Controller as ControllerType, Parser } from "react-cool-form";

import Input from "./Input";

interface Props {
  label: string;
  name: string;
  type?: string;
  controller: ControllerType<ChangeEvent<HTMLInputElement>>;
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
        validate: async (value, values) => {
          // console.log("LOG ===> validate: ", value, formState);
          // eslint-disable-next-line
          // await new Promise((resolve) => setTimeout(resolve, 1000));
          return value.length <= 3 ? "Field error" : "";
        },
        // value,
        // parser,
        onChange: (e, value) => {
          // setValue(value);
          // console.log("LOG ===> onChange: ", value);
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
