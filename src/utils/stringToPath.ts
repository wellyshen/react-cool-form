const memoized: Record<string, string[]> = {};

export default (str: string): string[] => {
  if (typeof str !== "string") throw new TypeError("Expected a string.");
  if (!str.length) return [];

  if (memoized[str] == null)
    memoized[str] = str.split(/[.[\]]+/).filter(Boolean);

  return memoized[str];
};
