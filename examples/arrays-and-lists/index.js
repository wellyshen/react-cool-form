import { render } from "react-dom";
import { useForm, useFieldArray } from "react-cool-form";

import "./styles.scss";

function App() {
  const { form } = useForm({
    defaultValues: {
      foo: [{ name: "Iron Mane" }, { name: "Thor" }, { name: "Hulk" }]
    },
    onSubmit: (values) => alert(JSON.stringify(values, undefined, 2))
  });
  const [fields, { push, insert, remove, swap, move }] = useFieldArray("foo");

  return (
    <form ref={form}>
      {/* The first parameter of the callback is an array that includes
          a supplied "fieldName" (name + index) and your field value */}
      {fields.map(([fieldName, { name }], index) => (
        <div
          key={fieldName} // Use the "fieldName" as the key
        >
          <input
            name={`${fieldName}.name`} // Use the "fieldName" + "YOUR PATH" as the name
            defaultValue={name} // Don't forget to provide the default value
          />
          <button type="button" onClick={() => remove(index)}>
            Remove
          </button>
        </div>
      ))}
      <div>
        <button type="button" onClick={() => push({ name: "Loki" })}>
          Push
        </button>
        <button type="button" onClick={() => insert(1, { name: "Spider Man" })}>
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
