module.exports = {
  extends: ["welly"],
  rules: {
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
  },
  settings: {
    polyfills: ["Promise"],
  },
};
