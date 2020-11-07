import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";
import replace from "@rollup/plugin-replace";
import { sizeSnapshot } from "rollup-plugin-size-snapshot";
import { terser } from "rollup-plugin-terser";

import pkg from "../package.json";

const babelRuntimeVersion = pkg.dependencies["@babel/runtime"].replace(
  /^[^0-9]*/,
  ""
);

const makeExternalPredicate = (external) =>
  !external.length
    ? () => false
    : (id) => new RegExp(`^(${external.join("|")})($|/)`).test(id);

export default ({ name, format, env, size }) => {
  const shouldMinify = env === "production";
  const fileName = [name, format, env, shouldMinify ? "min" : "", "js"]
    .filter(Boolean)
    .join(".");
  const extensions = [".ts"];
  const isUmd = format === "umd";

  return {
    input: "src",
    output: {
      file: `dist/${fileName}`,
      format,
      name: pkg.name,
      sourcemap: true,
      globals: { react: "React" },
      exports: "named",
    },
    plugins: [
      resolve({ extensions }),
      isUmd && commonjs({ include: /\/node_modules\// }),
      babel({
        exclude: "node_modules/**",
        plugins: [
          [
            "@babel/plugin-transform-runtime",
            { version: babelRuntimeVersion, helpers: !isUmd },
          ],
        ],
        babelHelpers: isUmd ? "bundled" : "runtime",
        extensions,
      }),
      replace({
        __DEV__: 'process.env.NODE_ENV !== "production"',
        ...(env ? { "process.env.NODE_ENV": JSON.stringify(env) } : {}),
      }),
      size && sizeSnapshot(),
      shouldMinify &&
        terser({
          output: { comments: false },
          compress: { drop_console: true },
        }),
    ].filter(Boolean),
    external: makeExternalPredicate(
      isUmd
        ? Object.keys(pkg.peerDependencies)
        : [
            ...Object.keys(pkg.peerDependencies),
            ...Object.keys(pkg.dependencies),
          ]
    ),
  };
};
