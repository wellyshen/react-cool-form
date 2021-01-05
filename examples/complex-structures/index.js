import React from "react";
import { render } from "react-dom";
import { useForm } from "react-cool-form";

import "./styles.scss";

const FieldGroup = ({ name, onUpdate, onClear }) => (
  <>
    <input name={name} placeholder={name} />
    <div>
      <button type="button" onClick={onUpdate}>
        Update
      </button>
      <button type="button" onClick={onClear}>
        Clear
      </button>
    </div>
  </>
);

function App() {
  const { form, setValue } = useForm({
    defaultValues: {
      foo: "",
      bar: [],
      baz: { nested: "" },
      qux: [{ nested: "" }]
    },
    onSubmit: (values) => alert(JSON.stringify(values, undefined, 2))
  });

  return (
    <form ref={form}>
      <FieldGroup
        name="foo"
        onUpdate={() => setValue("foo", "🍎")}
        onClear={() => setValue("foo")}
      />
      <FieldGroup
        name="bar[0]"
        onUpdate={() => setValue("bar[0]", "🍋")}
        onClear={() => setValue("bar[0]")}
      />
      <FieldGroup
        name="baz.nested"
        onUpdate={() => setValue("baz.nested", "🍉")}
        onClear={() => setValue("baz.nested")}
      />
      <FieldGroup
        name="qux[0].nested"
        onUpdate={() => setValue("qux[0].nested", "🥝")}
        onClear={() => setValue("qux[0].nested")}
      />
      <input type="submit" />
    </form>
  );
}

render(<App />, document.getElementById("root"));
