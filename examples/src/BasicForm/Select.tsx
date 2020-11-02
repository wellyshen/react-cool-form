/** @jsxImportSource @emotion/core */

import React, { memo, forwardRef } from "react";

import { label as labelStyle } from "./styles";

const Select = (
  { children, label, name, ...rest }: any,
  ref: any
): JSX.Element => {
  // console.log(`LOG ==> ${name} is re-rendered`);

  return (
    <>
      <label css={labelStyle} htmlFor={name}>
        {label}
      </label>
      <select id={name} name={name} {...rest} ref={ref}>
        {children}
      </select>
    </>
  );
};

export default memo(forwardRef(Select));
