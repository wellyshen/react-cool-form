import createConfig from "./createConfig";

const isProd = process.env.BUILD === "production";
const isBundleSize = process.env.BUILD === "bundlesize";
const name = "index";
const umdName = "ReactCoolForm";
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
  {
    name,
    umdName,
    format: "umd",
    env: "development",
  },
  {
    name,
    umdName,
    format: "umd",
    env: "production",
  },
];

export default options
  .filter(({ format }) => (isProd || isBundleSize ? true : format === "esm"))
  .map((option) => createConfig({ ...option, measure: isProd }));
