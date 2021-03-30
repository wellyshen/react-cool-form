"use strict";

if (process.env.NODE_ENV === "production") {
  module.exports = require("./index.cjs.production.min.js.js");
} else {
  module.exports = require("./index.cjs.development.js.js");
}
