import React from "react";
import { render } from "react-dom";
import { useForm } from "react-cool-form";

import "./styles.scss";

const FieldGroup = ({ name, onUpdate, onClear, ...rest }) => (
  <>
    <input name={name} placeholder={name} />
    <div>
      <button type="button" onClick={onUpdate}>
        Update {name}
      </button>
      <button type="button" onClick={onClear}>
        Clear {name}
      </button>
    </div>
  </>
);

function App() {
  const { form, setFieldValue } = useForm({
    defaultValues: {
      foo: "",
      bar: [],
      baz: { a: "" },
      qux: [{ a: "" }]
    },
    onSubmit: (values) => alert(JSON.stringify(values, undefined, 2))
  });

  return (
    <form ref={form}>
      <FieldGroup
        name="foo"
        onUpdate={() => setFieldValue("foo", "🍎")}
        onClear={() => setFieldValue("foo")}
      />
      <FieldGroup
        name="bar[0]"
        onUpdate={() => setFieldValue("bar[0]", "🍋")}
        onClear={() => setFieldValue("bar[0]")}
      />
      <FieldGroup
        name="baz.a"
        onUpdate={() => setFieldValue("baz.a", "🍉")}
        onClear={() => setFieldValue("baz.a")}
      />
      <FieldGroup
        name="qux[0].a"
        onUpdate={() => setFieldValue("qux[0].a", "🥝")}
        onClear={() => setFieldValue("qux[0].a")}
      />
      <input type="submit" />
    </form>
  );
}

render(<App />, document.getElementById("root"));
