import { forwardRef } from "react";

const Field = ({ label, id, error, ...rest }, ref) => (
  <div>
    <label htmlFor={id}>{label}</label>
    <input id={id} ref={ref} {...rest} />
    {error && <p>{error}</p>}
  </div>
);

export default forwardRef(Field);
