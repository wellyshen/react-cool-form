import { render } from "react-dom";
import { useForm } from "react-cool-form";

import "./styles.scss";

interface FormValues {
  firstName: string;
  lastName: string;
}

function App() {
  const { form } = useForm<FormValues>({
    defaultValues: {
      firstName: "Welly",
      lastName: true // 🙅🏻‍♀️ Type "boolean" is not assignable to type "string"
    },
    onSubmit: (values) => {
      console.log("First Name: ", values.firstName);
      console.log("Middle Name: ", values.middleName); // 🙅🏻‍♀️ Property "middleName" does not exist on type "FormValues"
    }
  });

  return (
    <form ref={form}>
      <input name="firstName" />
      <input name="lastName" />
      <input type="submit" />
    </form>
  );
}

render(<App />, document.getElementById("root"));
