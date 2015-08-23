let path = require('path');

let Exp = require('../application/Exp');
let PackagerController = require('../application/PackagerController');

module.exports = {
  runAsync: async function (env, args) {

    if (!env.root) {
      throw new Error("Can't run packager without `env.root` defined");
    }

    if (!env.entryPoint) {
      env.entryPoint = await Exp.determineEntryPoint(env.root);
    }

    // let mainModulePath = path.resolve(path.join(env.root, env.entryPoint));

    let pc = new PackagerController({
      absolutePath: path.resolve(env.root),
      entryPoint: env.entryPoint,
    });

    return pc;

  }
};
