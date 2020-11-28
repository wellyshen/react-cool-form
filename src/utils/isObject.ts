export default (value: unknown): value is Object =>
  value !== null && typeof value === "object";
