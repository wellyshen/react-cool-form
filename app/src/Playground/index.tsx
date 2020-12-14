import { useState } from "react";
import { useForm } from "react-cool-form";

interface FormValues {
  t1?: string;
  t2?: string;
}

const defaultValues = {
  // t1: "form value",
  // t2: "form value",
};

const Playground = (): JSX.Element => {
  const [show1, setShow1] = useState(true);
  const [show2, setShow2] = useState(true);
  const { form, field, getState, controller } = useForm<FormValues>({
    defaultValues,
    onSubmit: (values) => console.log(values),
  });
  /* const state = getState(
    {
      values: "values",
      errors: "errors",
      touched: "touched",
      dirtyFields: "dirtyFields",
    },
    { filterUntouchedError: false }
  ); */
  // console.log("LOG ===> ", state);

  return (
    <form ref={form} noValidate>
      {show1 && (
        <input
          name="t1"
          // type="date"
          ref={field({
            valueAsNumber: true,
            parse: (value) => `Parsed ${value}`,
          })}
          defaultValue="1"
          minLength={5}
        />
      )}
      {show2 && (
        <input
          {...controller("t2", {
            // parse: (value) => `Parsed ${value}`,
            defaultValue: "1",
          })}
          minLength={5}
        />
      )}
      <input type="submit" />
      <button type="button" onClick={() => setShow1(!show1)}>
        Toggle1
      </button>
      <button type="button" onClick={() => setShow2(!show2)}>
        Toggle2
      </button>
    </form>
  );
};

export default Playground;
