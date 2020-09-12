/** @jsx jsx */

import { jsx } from "@emotion/core";
import React, { useState, memo, useCallback, useMemo, useReducer } from "react";
import useForm from "react-cool-form";

import { container, form } from "./styles";

const TextField = memo(
  ({ label, id, ...rest }: any): JSX.Element => {
    console.log(`${id} is re-rendered`);

    return (
      <React.Fragment>
        <label htmlFor={id}>{label}</label>
        <input id={id} {...rest} />
      </React.Fragment>
    );
  }
);

const reducer = (state: any, action: any) => {
  switch (action.type) {
    case "firstName":
      return { ...state, firstName: action.payload };
    case "lastName":
      return { ...state, lastName: action.payload };
    default:
      throw new Error("Unexpected action");
  }
};

export default (): JSX.Element => {
  // @ts-expect-error
  const res = useForm();
  console.log("LOG ===> ", res);
  const [state, dispatch] = useReducer(reducer, {
    firstName: "",
    lastName: "",
  });
  // const [values, setValues] = useState<any>({ firstName: "", lastName: "" });
  // const [firstName, setFirstName] = useState("");
  // const [lastName, setLastName] = useState("");

  const handleSubmit = (e: any) => {
    e.preventDefault();
    console.log("LOG ===> ", state);
  };

  const handleChange = useCallback((e: any) => {
    const { id, value } = e.target;
    dispatch({ type: id, payload: value });
    // const { id, value } = e.target;
    // setValues({ ...values, [id]: value });
  }, []);

  /* const handleFirstNameChange = useCallback((e: any) => {
    setFirstName(e.target.value);
  }, []);

  const handleLastNameChange = useCallback((e: any) => {
    setLastName(e.target.value);
  }, []); */

  // const memoValues = useMemo(() => values, [values]);

  return (
    <div css={container}>
      <form css={form} onSubmit={handleSubmit} noValidate>
        <TextField
          label="First Name: "
          id="firstName"
          name="firstName"
          type="text"
          required
          value={state.firstName}
          onLoad={(e: any) => {
            console.log("LOG ===> ", e);
          }}
          onChange={handleChange}
        />
        <TextField
          label="Last Name: "
          id="lastName"
          name="lastName"
          type="text"
          required
          value={state.lastName}
          onChange={handleChange}
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};
