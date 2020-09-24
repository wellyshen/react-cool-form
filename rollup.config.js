import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";
import replace from "@rollup/plugin-replace";
import { sizeSnapshot } from "rollup-plugin-size-snapshot";
import { terser } from "rollup-plugin-terser";
import copy from "rollup-plugin-copy";

import pkg from "./package.json";

const isDev = process.env.BUILD === "dev";
const extensions = [".js", ".ts", ".tsx", ".json"];

export default {
  input: "src",
  output: [
    {
      file: pkg.main,
      format: "cjs",
      sourcemap: isDev,
      exports: "named",
    },
    {
      file: pkg.module,
      format: "esm",
      sourcemap: isDev,
      exports: "named",
    },
  ],
  plugins: [
    resolve({ extensions }),
    commonjs(),
    babel({ exclude: "node_modules/**", extensions }),
    replace({
      __DEV__: 'process.env.NODE_ENV !== "production"',
      // TODO: Enable it for smaller bundle size
      /* "process.env.NODE_ENV": JSON.stringify(
        isDev ? "development" : "production"
      ), */
    }),
    !isDev && sizeSnapshot(),
    // Disable "module" to avoid the missing semicolon bug of .esm
    !isDev && terser({ module: false }),
    copy({
      targets: [
        {
          src: "src/types/react-cool-form.d.ts",
          dest: pkg.types.split("/")[0],
          rename: "index.d.ts",
        },
      ],
    }),
  ].filter(Boolean),
  external: Object.keys(pkg.peerDependencies),
};
