/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from "@emotion/core";
import React, { memo, forwardRef } from "react";

import { label as labelStyle } from "./styles";

const Input = ({ label, id, name, ...rest }: any, ref: any): JSX.Element => {
  // console.log(`LOG ==> ${name} is re-rendered`);

  return (
    <React.Fragment>
      <label css={labelStyle} htmlFor={id || name}>
        {label}
      </label>
      <input id={id || name} name={name} {...rest} ref={ref} />
    </React.Fragment>
  );
};

export default memo(forwardRef(Input));
