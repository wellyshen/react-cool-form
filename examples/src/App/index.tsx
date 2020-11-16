import React from "react";
import { Global, css } from "@emotion/react";
import normalize from "normalize.css";

import BasicFrom from "../BasicForm";
import { root } from "./styles";

export default (): JSX.Element => (
  <>
    <Global
      styles={css`
        ${normalize}
        ${root}
      `}
    />
    <BasicFrom />
  </>
);
