/* eslint-disable no-console */

import { useRef, useState } from "react";
import { useForm, useFieldArray, useControlled } from "react-cool-form";

const getId = () => Math.floor(Math.random() * 10000).toString();

const Field = ({ name, ...restProps }: any) => {
  const [props] = useControlled(name, restProps);
  return <input {...props} />;
};

export default () => {
  const [show, setShow] = useState(false);
  const inRef = useRef<HTMLInputElement>(null);
  const rmRef = useRef<HTMLInputElement>(null);
  const swARef = useRef<HTMLInputElement>(null);
  const swBRef = useRef<HTMLInputElement>(null);
  const mvARef = useRef<HTMLInputElement>(null);
  const mvBRef = useRef<HTMLInputElement>(null);
  const { form, setValue, mon } = useForm({
    defaultValues: {
      foo: [
        { id: "0", val: "0" },
        { id: "1", val: "1" },
      ],
    },
    onSubmit: (values) => console.log("onSubmit: ", values),
    onError: (errors) => console.log("onError: ", errors),
  });
  const [fields, { push, insert, remove, swap, move }] = useFieldArray("foo");

  console.log("LOG ===> Re-rendering", fields);

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
          <input key={id} name={`foo[${idx}].val`} defaultValue={val} />
        ))}
        <input type="submit" />
        <input type="reset" />
        <button type="button" onClick={() => setShow(!show)}>
          Toggle
        </button>
      </form>
    </>
  );
};
