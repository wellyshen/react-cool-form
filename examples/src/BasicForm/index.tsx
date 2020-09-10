/** @jsx jsx */

import { jsx } from "@emotion/core";
import React, { useState, memo, useCallback, useMemo } from "react";

import { container, form } from "./styles";

const TextField = memo(
  ({ label, id, ...rest }: any): JSX.Element => {
    console.log(`${id} is re-rendered`);

    return (
      <React.Fragment>
        <label htmlFor={id}>First Name: </label>
        <input id={id} {...rest} />
      </React.Fragment>
    );
  }
);

export default (): JSX.Element => {
  const [values, setValues] = useState<any>({});
  // const [firstName, setFirstName] = useState("");
  // const [lastName, setLastName] = useState("");

  const handleSubmit = (e: any) => {
    e.preventDefault();
    console.log("LOG ===> ", values);
  };

  const handleChange = useCallback((e: any) => {
    const { id, value } = e.target;
    setValues({ [id]: value });
  }, []);

  /* const handleFirstNameChange = useCallback((e: any) => {
    setFirstName(e.target.value);
  }, []);

  const handleLastNameChange = useCallback((e: any) => {
    setLastName(e.target.value);
  }, []); */

  const memoValues = useMemo(() => values, [values]);

  return (
    <div css={container}>
      <form css={form} onSubmit={handleSubmit} noValidate>
        <TextField
          label="First Name: "
          id="firstName"
          name="firstName"
          type="text"
          required
          value={memoValues.firstName || ""}
          onChange={handleChange}
        />
        <TextField
          label="Last Name: "
          id="lastName"
          name="lastName"
          type="text"
          required
          value={memoValues.lastName || ""}
          onChange={handleChange}
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};
