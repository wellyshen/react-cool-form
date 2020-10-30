/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from "@emotion/core";
import React, { memo, forwardRef } from "react";

import { label as labelStyle } from "./styles";

const TextArea = ({ label, name, ...rest }: any, ref: any): JSX.Element => {
  // console.log(`LOG ==> ${name} is re-rendered`);

  return (
    <React.Fragment>
      <label css={labelStyle} htmlFor={name}>
        {label}
      </label>
      <textarea id={name} name={name} {...rest} ref={ref} />
    </React.Fragment>
  );
};

export default memo(forwardRef(TextArea));
