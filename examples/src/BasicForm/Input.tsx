/** @jsxImportSource @emotion/react */
/** @jsxFrag */

import { memo, forwardRef } from "react";

import { label as labelStyle } from "./styles";

const Input = ({ label, id, name, ...rest }: any, ref: any): JSX.Element => {
  // console.log(`LOG ==> ${name} is re-rendered`);

  return (
    <>
      <label css={labelStyle} htmlFor={id || name}>
        {label}
      </label>
      <input id={id || name} name={name} {...rest} ref={ref} />
    </>
  );
};

export default memo(forwardRef(Input));
