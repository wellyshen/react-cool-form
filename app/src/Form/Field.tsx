import { ChangeEvent, memo, useState } from "react";
import { Field as FieldType, Parse, FieldValidator } from "react-cool-form";

import { FormValues } from ".";

import Input from "./Input";

interface Props {
  label: string;
  name: string;
  type?: string;
  defaultValue: any;
  field: FieldType<FormValues, ChangeEvent<HTMLInputElement>>;
  validate?: FieldValidator<FormValues>;
  [k: string]: any;
}

const Field = ({
  label,
  name,
  type,
  defaultValue,
  field,
  validate,
  ...rest
}: Props) => {
  // console.log(`LOG ==> ${name} is re-rendered`);

  const [value, setValue] = useState(defaultValue);
  const parse: Parse<ChangeEvent<HTMLInputElement>> = (e) =>
    e.target.value.length % 2 ? "case 1" : "case 2";

  return (
    <Input
      label={label}
      type={type}
      {...field(name, {
        validate,
        value,
        defaultValue: "welly",
        // parse,
        format: (val) => `formatted ${val}`,
        onChange: (e, val) => {
          setValue(val);
          // setValue(e.target.value);
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

Field.defaultProps = {
  type: undefined,
  validate: () => null,
};

export default memo(Field);
