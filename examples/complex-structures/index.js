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
      baz: { nested: "" },
      qux: [{ nested: "" }]
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
        name="baz.nested"
        onUpdate={() => setFieldValue("baz.nested", "🍉")}
        onClear={() => setFieldValue("baz.nested")}
      />
      <FieldGroup
        name="qux[0].nested"
        onUpdate={() => setFieldValue("qux[0].nested", "🥝")}
        onClear={() => setFieldValue("qux[0].nested")}
      />
      <input type="submit" />
    </form>
  );
}

render(<App />, document.getElementById("root"));
