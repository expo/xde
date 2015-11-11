const path   = require("path");
const fs     = require("fs");
const assert = require("assert");
const babel  = require("babel");
const plugin = require("../src/index");

function trim(str) {
  return str.replace(/^\s+|\s+$/, "");
}

describe("emit flow comments from flow types", () => {
  const fixturesDir = path.join(__dirname, "fixtures");
  fs.readdirSync(fixturesDir).map((caseName) => {
    it(`should ${caseName.split("-").join(" ")}`, () => {
      const fixtureDir = path.join(fixturesDir, caseName);
      const actual     = babel.transformFileSync(
        path.join(fixtureDir, "actual.js"), {
          plugins: [plugin]
        }
      ).code;
      const expected = fs.readFileSync(path.join(fixtureDir, "expected.js")).toString();

      assert.equal(trim(actual), trim(expected));
    });
  });
});
