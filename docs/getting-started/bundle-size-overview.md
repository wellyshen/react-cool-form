---
id: bundle-size-overview
title: Bundle Size Overview
---

React Cool Form is a tiny size library ([~ 7KB](https://bundlephobia.com/result?p=react-cool-form)), it supports [ES modules](https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive) format. With the ES modules, modules bundler (e.g. [webpack](https://webpack.js.org) or [Rollup](https://rollupjs.org/guide)) can automatically remove dead-code through the [tree shaking](https://developer.mozilla.org/en-US/docs/Glossary/Tree_shaking) technique to reduce the bundle size of your app. The size of each module as below:

| Name                                                | Size    |
| --------------------------------------------------- | ------- |
| [useForm](../api-reference/use-form)                | ~ 5.6kB |
| [useFormMethods](../api-reference/use-form-methods) | ~ 255B  |
| [useFormState](../api-reference/use-form-state)     | ~ 302B  |
| [useControlled](../api-reference/use-controlled)    | ~ 783B  |
| [useFieldArray](../api-reference/use-field-array)   | ~ 870B  |
| [get](../api-reference/utility-functions#get)       | ~ 5B    |
| [set](../api-reference/utility-functions#set)       | ~ 5B    |
| [unset](../api-reference/utility-functions#unset)   | ~ 6B    |
