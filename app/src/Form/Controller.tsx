import { ChangeEvent, memo, useState } from "react";
import {
  Controller as ControllerType,
  Parse,
  FieldValidator,
} from "react-cool-form";

import { FormValues } from ".";

import Input from "./Input";

interface Props {
  label: string;
  name: string;
  type?: string;
  defaultValue: any;
  controller: ControllerType<FormValues, ChangeEvent<HTMLInputElement>>;
  validate?: FieldValidator<FormValues>;
  [k: string]: any;
}

const Controller = ({
  label,
  name,
  type,
  defaultValue,
  controller,
  validate,
  ...rest
}: Props) => {
  // console.log(`LOG ==> ${name} is re-rendered`);

  const [value, setValue] = useState(defaultValue);
  const parse: Parse<ChangeEvent<HTMLInputElement>> = (val) => `parsed ${val}`;

  return (
    <Input
      label={label}
      type={type}
      {...controller(name, {
        validate,
        value,
        // defaultValue: "welly",
        parse,
        // format: (val) => `formatted ${val}`,
        onChange: (e, val) => {
          setValue(val);
          // console.log("LOG ===> onChange: ", val);
        },
        onBlur: (e) => {
          // console.log("LOG ===> onBlur: ", e);
        },
      })}
      {...rest}
    />
  );
};

Controller.defaultProps = {
  type: undefined,
  validate: () => null,
};

export default memo(Controller);
