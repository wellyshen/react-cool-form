/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from "@emotion/core";
import React, { memo, forwardRef } from "react";

import { label as labelStyle } from "./styles";

const Select = (
  { children, label, name, ...rest }: any,
  ref: any
): JSX.Element => {
  // console.log(`LOG ==> ${name} is re-rendered`);

  return (
    <React.Fragment>
      <label css={labelStyle} htmlFor={name}>
        {label}
      </label>
      <select id={name} name={name} {...rest} ref={ref}>
        {children}
      </select>
    </React.Fragment>
  );
};

export default memo(forwardRef(Select));
