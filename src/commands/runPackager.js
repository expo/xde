let path = require('path');

let PackagerController = require('../application/PackagerController');

module.exports = {
  runAsync: async function (env, args) {
    let pc = new PackagerController({
      absolutePath: path.resolve(env.root),
      // TODO: Guess the main module path from the package.json
      // Or should that be baked into the PackagerController?
      // It probably should
    });

    await pc.startAsync();

    return pc;

  }
};
