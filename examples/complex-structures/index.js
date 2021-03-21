import { render } from "react-dom";
import { useForm } from "react-cool-form";

import "./styles.scss";

const FieldGroup = ({ name, onUpdate, onClear }) => (
  <>
    <input name={name} placeholder={name} />
    <div>
      <button type="button" onClick={onUpdate}>
        UPDATE
      </button>
      <button type="button" onClick={onClear}>
        CLEAR
      </button>
    </div>
  </>
);

function App() {
  const { form, setValue } = useForm({
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
        onUpdate={() => setValue("foo", "🍎")}
        onClear={() => setValue("foo")}
      />
      <FieldGroup
        name="bar[0]"
        onUpdate={() => setValue("bar[0]", "🍋")}
        onClear={() => setValue("bar[0]")}
      />
      <FieldGroup
        name="baz.a"
        onUpdate={() => setValue("baz.a", "🍉")}
        onClear={() => setValue("baz.a")}
      />
      <FieldGroup
        name="qux[0].a"
        onUpdate={() => setValue("qux[0].a", "🥝")}
        onClear={() => setValue("qux[0].a")}
      />
      <input type="submit" />
    </form>
  );
}

render(<App />, document.getElementById("root"));
