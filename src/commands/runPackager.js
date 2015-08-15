let path = require('path');

let packager = require('../application/packager');


module.exports = {
  runAsync: async function (env, args) {
    let pc = new packager.PackagerController({
      absolutePath: path.resolve(env.root),
      // TODO: Guess the main module path from the package.json
      // Or should that be baked into the PackagerController?
      // It probably should
    });

    await pc.startAsync();

  }
};
