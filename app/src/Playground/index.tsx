/* eslint-disable no-console */

import { useForm, useFieldArray } from "react-cool-form";

export default () => {
  const { form } = useForm({
    defaultValues: {
      foo: [
        {
          name: "Iron Man",
          arr: [{ name: "iron arr.0" }, { name: "iron arr.1" }],
        },
      ],
    },
    onSubmit: (values) => alert(JSON.stringify(values, undefined, 2)),
  });
  const [fields, { push, insert, remove }] = useFieldArray("foo");

  return (
    <form ref={form}>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Arr</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((fieldName, index) => (
            <tr key={fieldName}>
              <td>
                <input name={`${fieldName}.name`} />
              </td>
              <td>
                <Arr field={fieldName} />
              </td>
              <td>
                <button type="button" onClick={() => remove(index)}>
                  REMOVE
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <button
          type="button"
          onClick={() => {
            push({ name: "Loki", arr: [{ name: "Your Savior Is Here" }] });
          }}
        >
          PUSH
        </button>
        <button
          type="button"
          onClick={() =>
            insert(0, {
              name: "Spider Man",
              arr: [{ name: "Your Friendly Neighborhood Spider-Man" }],
            })
          }
        >
          INSERT
        </button>
      </div>
      <input type="submit" />
      <input type="reset" />
    </form>
  );
};

function Arr({ field }: any) {
  const [fields, { push }] = useFieldArray(`${field}.arr`);

  return (
    <div>
      {fields.map((fieldName) => (
        <input
          key={fieldName}
          style={{ height: "20px", width: "100px" }}
          type="text"
          name={`${fieldName}.name`}
        />
      ))}
      <button type="button" onClick={() => push({ name: "xxx" })}>
        inner push
      </button>
    </div>
  );
}
