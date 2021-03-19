import { render } from "react-dom";
import { useForm, useFieldArray } from "react-cool-form";

import "./styles.scss";

function App() {
  const { form } = useForm({
    defaultValues: {
      foo: [
        { id: "0", name: "Iron Mane" },
        { id: "1", name: "Thor" },
        { id: "2", name: "Hulk" }
      ]
    },
    onSubmit: (values) => alert(JSON.stringify(values, undefined, 2))
  });
  const [fields, { push, insert, remove, swap, move }] = useFieldArray("foo");

  return (
    <form ref={form}>
      {fields.map(({ id, name }, index) => (
        <div key={id}>
          <input name={`foo[${index}].name`} defaultValue={name} />
          <button type="button" onClick={() => remove(index)}>
            Remove
          </button>
        </div>
      ))}
      <div>
        <button type="button" onClick={() => push({ id: "3", name: "Loki" })}>
          Push
        </button>
        <button
          type="button"
          onClick={() => insert(1, { id: "4", name: "Spider Man" })}
        >
          Insert
        </button>
        <button type="button" onClick={() => swap(0, 1)}>
          Swap
        </button>
        <button type="button" onClick={() => move(2, 0)}>
          Move
        </button>
      </div>
      <input type="submit" />
      <input type="reset" />
    </form>
  );
}

render(<App />, document.getElementById("root"));
