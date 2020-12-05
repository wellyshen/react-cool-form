import { Global, css } from "@emotion/react";
import normalize from "normalize.css";

import Playground from "../Playground";
import Automation from "../Automation";
import { root } from "./styles";

export default (): JSX.Element => (
  <>
    <Global
      styles={css`
        ${normalize}
        ${root}
      `}
    />
    {process.env.REACT_APP_ENV === "dev" ? <Playground /> : <Automation />}
  </>
);
