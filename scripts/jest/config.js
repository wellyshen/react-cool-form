module.exports = {
  preset: "ts-jest",
  rootDir: "../../",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/scripts/jest/setup.ts"],
  collectCoverageFrom: ["src/**/*.ts", "!**/index.ts", "!src/types/*"],
  globals: { __DEV__: true },
};
