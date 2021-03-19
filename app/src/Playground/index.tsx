/* eslint-disable no-console */

import { useRef, useState } from "react";
import { useForm, useFieldArray, useControlled } from "react-cool-form";

const getId = () => Math.floor(Math.random() * 10000).toString();

const Field = ({ name, ...rest }: any) => {
  const [props] = useControlled(name, rest);
  return <input {...props} />;
};

const FieldArray = ({ name }: any) => {
  const [fields, { push }] = useFieldArray(name, {
    defaultValue: [
      { id: "2", val: "2" },
      { id: "3", val: "3" },
    ],
  });

  return (
    <>
      {fields.map(({ id, val }, idx) => (
        <input key={id} name={`${name}[${idx}].val`} defaultValue={val} />
      ))}
      <button type="button" onClick={() => push({ id: "3", val: "3" })}>
        Push
      </button>
    </>
  );
};

export default () => {
  const [show, setShow] = useState(false);
  const inRef = useRef<HTMLInputElement>(null);
  const reRef = useRef<HTMLInputElement>(null);
  const rmRef = useRef<HTMLInputElement>(null);
  const swARef = useRef<HTMLInputElement>(null);
  const swBRef = useRef<HTMLInputElement>(null);
  const mvARef = useRef<HTMLInputElement>(null);
  const mvBRef = useRef<HTMLInputElement>(null);
  const { form, mon, reset, setValue, field } = useForm({
    defaultValues: {
      // foo: [
      //   { id: "0", val: "0" },
      //   { id: "1", val: "1" },
      // ],
      // bar: [
      //   { id: "0", val: "0" },
      //   { id: "1", val: "1" },
      // ],
    },
    // shouldRemoveField: false,
    // validate: (values) => {
    //   const errors: { foo?: string } = {};
    //   if (!values.foo.length) errors.foo = "Required";
    //   return errors;
    // },
    onSubmit: (values) => console.log("onSubmit: ", values),
    onError: (errors) => console.log("onError: ", errors),
  });
  const [fields, { push, insert, remove, swap, move }] = useFieldArray("foo", {
    defaultValue: [
      { id: "2", val: "2" },
      { id: "3", val: "3" },
    ],
    validate: (value, values) => {
      console.log("LOG ===> ", value, values);
    },
  });

  // console.log("LOG ===> Re-renders");
  /* console.log(
    "LOG ===> State: ",
    mon({
      values: "values.foo",
      touched: "touched.foo",
      errors: "errors.foo",
      dirty: "dirty.foo",
      isDirty: "isDirty",
    })
  ); */

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
          <span key={id}>
            <input
              name={`foo[${idx}].val`}
              defaultValue={val}
              // ref={field((value) => (!value.length ? "Required" : false))}
            />
            {/* {show && <input name={`foo[${idx}].test`} defaultValue="test" />} */}
          </span>
        ))}
        {show && <FieldArray name="bar" />}
        <input type="submit" />
        <input type="reset" />
        <button type="button" onClick={() => setShow(!show)}>
          Toggle
        </button>
      </form>
    </>
  );
};
