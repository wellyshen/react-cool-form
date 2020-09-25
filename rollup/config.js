import createConfig from "./createConfig";

const isDev = process.env.BUILD !== "production";
const name = "index";
const options = [
  {
    name,
    format: "cjs",
    env: "development",
  },
  {
    name,
    format: "cjs",
    env: "production",
  },
  {
    name,
    format: "esm",
  },
];

export default options
  .filter(({ format }) => (isDev ? format === "esm" : true))
  .map((option) => createConfig({ ...option, size: !isDev }));
