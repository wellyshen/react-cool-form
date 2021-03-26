module.exports = {
  extends: ["welly"],
  rules: {
    eqeqeq: "off",
    camelcase: "off",
    "no-shadow": "off",
    "no-console": [
      "warn",
      {
        allow: ["warn", "error"],
      },
    ],
    "no-param-reassign": "off",
    "no-underscore-dangle": "off",
    "no-sparse-arrays": "off",
    "no-restricted-syntax": "off",
    "react/react-in-jsx-scope": "off",
    "react/require-default-props": "off",
    "@typescript-eslint/ban-types": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
  },
  settings: {
    polyfills: ["Promise"],
  },
};
