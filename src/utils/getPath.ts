export default (path: string): string =>
  ![
    "values",
    "touched",
    "errors",
    "isDirty",
    "dirty",
    "isValidating",
    "isValid",
    "isSubmitting",
    "isSubmitted",
    "submitCount",
  ].some((key) => path.startsWith(key))
    ? `values.${path}`
    : path;
