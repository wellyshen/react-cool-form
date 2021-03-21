import { render } from "react-dom";
import { useForm, useFieldArray } from "react-cool-form";

import "./styles.scss";

let count = 0;

function App() {
  count++;

  const { form, mon } = useForm({
    defaultValues: {
      foo: [{ name: "Iron Mane" }, { name: "Thor" }, { name: "Hulk" }]
    },
    onSubmit: (values) => alert(JSON.stringify(values, undefined, 2))
  });
  const [fields, { push, insert, remove, swap, move }] = useFieldArray("foo");

  /* console.log(
    "Field value: ",
    mon({ value: "values.foo", touched: "touched.foo", dirty: "dirty.foo" })
  ); */

  return (
    <form ref={form}>
      <div className="count">Render {count} times</div>
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
            REMOVE
          </button>
        </div>
      ))}
      <div>
        <button type="button" onClick={() => push({ name: "Loki" })}>
          PUSH
        </button>
        <button type="button" onClick={() => insert(0, { name: "Spider Man" })}>
          INSERT
        </button>
        <button type="button" onClick={() => swap(0, 1)}>
          SWAP
        </button>
        <button type="button" onClick={() => move(2, 0)}>
          MOVE
        </button>
      </div>
      <input type="submit" />
      <input type="reset" />
    </form>
  );
}

render(<App />, document.getElementById("root"));
