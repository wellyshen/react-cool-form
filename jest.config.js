module.exports = {
  preset: "ts-jest",
  collectCoverageFrom: ["src/**/*.ts", "!src/index.ts", "!src/types/*"],
};
