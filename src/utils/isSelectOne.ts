import { FieldElement } from "../types";

export default (field: FieldElement): field is HTMLSelectElement =>
  field.type === "select-one";
