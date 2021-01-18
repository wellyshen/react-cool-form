module.exports = {
  preset: "ts-jest",
  collectCoverageFrom: ["src/**/*.ts", "!**/index.ts", "!src/types/*"],
  globals: { __DEV__: true },
};
