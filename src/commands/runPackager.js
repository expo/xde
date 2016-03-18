let path = require('path');

import {
  Exp,
  PackagerController,
} from 'xdl';

module.exports = {
  runAsync: async function (env, app) {

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
    }, app);

    // Write the recent Exps JSON file
    await Exp.saveRecentExpRootAsync(env.root);

    return pc;

  }
};
