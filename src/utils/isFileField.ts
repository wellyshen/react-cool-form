import { FieldElement } from "../types";

export default (field: FieldElement): field is HTMLInputElement =>
  field.type === "file";
