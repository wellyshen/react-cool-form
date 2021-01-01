export default (str: string): string[] => {
  if (typeof str !== "string") throw new TypeError("Expected a string.");
  if (!str.length) return [];

  return str.split(/[.[\]]+/).filter(Boolean);
};
