/** @jsxImportSource @emotion/react */
/** @jsxFrag */

import { memo, forwardRef } from "react";

import { label as labelStyle } from "./styles";

const TextArea = ({ label, name, ...rest }: any, ref: any): JSX.Element => {
  // console.log(`LOG ==> ${name} is re-rendered`);

  return (
    <>
      <label css={labelStyle} htmlFor={name}>
        {label}
      </label>
      <textarea id={name} name={name} {...rest} ref={ref} />
    </>
  );
};

export default memo(forwardRef(TextArea));
