import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";
import replace from "@rollup/plugin-replace";
import { sizeSnapshot } from "rollup-plugin-size-snapshot";
import { terser } from "rollup-plugin-terser";

import pkg from "../package.json";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default ({ name, format, env, size }) => {
  const extensions = [".ts"];
  const shouldMinify = env === "production";
  const fileName = [name, format, env, shouldMinify ? "min" : "", "js"]
    .filter(Boolean)
    .join(".");

  return {
    input: "src",
    output: {
      file: `dist/${fileName}`,
      format,
      name,
      sourcemap: true,
      globals: { react: "React" },
      exports: "named",
    },
    plugins: [
      resolve({ extensions }),
      commonjs(),
      babel({
        exclude: "node_modules/**",
        babelHelpers: "runtime",
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
    external: [...Object.keys(pkg.peerDependencies), /@babel\/runtime/],
  };
};
