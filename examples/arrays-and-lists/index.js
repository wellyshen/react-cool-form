import { render } from "react-dom";
import { useForm, useFieldArray } from "react-cool-form";

import "./styles.scss";

let count = 0;

function App() {
  count++;

  const { form, focus, use } = useForm({
    defaultValues: {
      foo: [
        { name: "Iron Man", quote: "I'm Iron Man" },
        { name: "Thor", quote: "I Knew It" },
        { name: "Hulk", quote: "Bout Time" }
      ]
    },
    onSubmit: (values) => alert(JSON.stringify(values, undefined, 2))
  });
  const [fields, { push, insert, remove, swap, move }] = useFieldArray("foo");

  /* console.log(
    "Field value: ",
    use({ value: "foo", touched: "touched.foo", dirty: "dirty.foo" })
  ); */

  return (
    <form ref={form}>
      <div className="count">Render {count} times</div>
      {/* The first parameter of the callback supplies you a field name (e.g. foo[0], foo[1]) */}
      {fields.map((fieldName, index) => (
        // Use the "fieldName" as the key
        <div key={fieldName}>
          {/* Use the "fieldName" + "YOUR PATH" as the name */}
          <input name={`${fieldName}.name`} />
          <input name={`${fieldName}.quote`} />
          <button type="button" onClick={() => remove(index)}>
            REMOVE
          </button>
        </div>
      ))}
      <div>
        <button
          type="button"
          onClick={() => {
            push({ name: "Loki", quote: "Your Savior Is Here" });
            // We need to wait for the item rendered (delay = 0 is acceptable) then apply focus to the first field
            focus(`foo[${fields.length}]`, 300);
            // You can also apply focus to a specified field
            // focus(`foo[${fields.length}].quote`, 300);
          }}
        >
          PUSH
        </button>
        <button
          type="button"
          onClick={() =>
            insert(0, {
              name: "Spider Man",
              quote: "Your Friendly Neighborhood Spider-Man"
            })
          }
        >
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
