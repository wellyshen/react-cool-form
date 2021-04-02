import { forwardRef } from "react";

const Select = ({ label, id, children, error, ...rest }, ref) => (
  <div>
    <label htmlFor={id}>{label}</label>
    <select id={id} ref={ref} {...rest}>
      {children}
    </select>
    {error && <p>{error}</p>}
  </div>
);

export default forwardRef(Select);
