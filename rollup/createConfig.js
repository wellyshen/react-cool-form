import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";
import replace from "@rollup/plugin-replace";
import { sizeSnapshot } from "rollup-plugin-size-snapshot";
import visualizer from "rollup-plugin-visualizer";
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

export default ({ name, umdName, format, env, size }) => {
  const extensions = [".ts"];
  const isCjs = format === "cjs";
  const isUmd = format === "umd";
  const isProd = env === "production";
  const fileName = [name, format, env, isProd ? "min" : "", "js"]
    .filter(Boolean)
    .join(".");

  return {
    input: "src",
    output: {
      file: `${pkg.files[0]}/${fileName}`,
      format,
      name: umdName,
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
            {
              version: babelRuntimeVersion,
              useESModules: !isCjs,
              helpers: !isUmd,
            },
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
      isUmd && isProd && visualizer(),
      isProd &&
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
