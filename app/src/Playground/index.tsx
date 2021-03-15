/* eslint-disable no-console */

import { useRef } from "react";
import { useForm, useFieldArray, useControlled } from "react-cool-form";

const getId = () => Math.floor(Math.random() * 10000).toString();

const Field = ({ name, ...rest }: any) => {
  const [props] = useControlled(name, rest);
  return <input {...props} />;
};

export default () => {
  const inRef = useRef<HTMLInputElement>(null);
  const rmRef = useRef<HTMLInputElement>(null);
  const swARef = useRef<HTMLInputElement>(null);
  const swBRef = useRef<HTMLInputElement>(null);
  const mvARef = useRef<HTMLInputElement>(null);
  const mvBRef = useRef<HTMLInputElement>(null);
  const { form, select, reset, setValue } = useForm({
    defaultValues: {
      foo: [
        { id: "0", val: "" },
        { id: "1", val: "" },
      ],
    },
    shouldRemoveField: false,
    onSubmit: (values) => console.log("onSubmit: ", values),
  });
  const [fields, { push, insert, remove, swap, move }] = useFieldArray("foo");

  // console.log("LOG ===> Re-renders");
  console.log(
    "LOG ===> State: ",
    select({
      values: "values.foo",
      touched: "touched.foo",
      errors: "errors.foo",
      dirty: "dirty.foo",
      isDirty: "isDirty",
    })
  );

  return (
    <>
      <button
        type="button"
        onClick={() =>
          setValue("foo", [
            { id: "0", val: "0" },
            { id: "1", val: "1" },
          ])
        }
      >
        Set Value
      </button>
      <br />
      <button
        type="button"
        onClick={() =>
          push({ id: getId(), val: getId() }, { shouldDirty: false })
        }
      >
        Push
      </button>
      <br />
      <button
        type="button"
        onClick={() =>
          insert(
            // @ts-expect-error
            +inRef.current.value,
            { id: getId(), val: getId() }
            // { shouldDirty: true, shouldTouched: true }
          )
        }
      >
        Insert
      </button>
      <input ref={inRef} />
      <br />
      <button
        type="button"
        onClick={() =>
          // @ts-expect-error
          console.log("LOG ===> Remove: ", remove(+rmRef.current.value))
        }
      >
        Remove
      </button>
      <input ref={rmRef} />
      <br />
      <button
        type="button"
        // @ts-expect-error
        onClick={() => swap(+swARef.current.value, +swBRef.current.value)}
      >
        Swap
      </button>
      <input ref={swARef} />
      <input ref={swBRef} />
      <br />
      <button
        type="button"
        // @ts-expect-error
        onClick={() => move(+mvARef.current.value, +mvBRef.current.value)}
      >
        Move
      </button>
      <input ref={mvARef} />
      <input ref={mvBRef} />
      <form ref={form}>
        {fields.map(({ id, val }, idx) => (
          <div key={id}>
            <Field name={`foo[${idx}].val`} defaultValue={val} />
          </div>
        ))}
        <input type="submit" />
        <input type="reset" />
      </form>
    </>
  );
};
