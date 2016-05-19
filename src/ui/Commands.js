import { remote } from 'electron';
import {
  Exp,
} from 'xdl';

async function showOpenDialog(opts) {
  return new Promise((fulfill, reject) => {
    let { dialog } = remote;
    dialog.showOpenDialog(opts, (selections) => {
      fulfill(selections);
    });
  });
}

module.exports = {
  async newExpAsync() {
    let selections = await showOpenDialog({
      properties: ['openDirectory', 'createDirectory'],
    });

    if (selections == null) {
      console.log("No selections; cancelled New Exp");
      return null;
    }

    let selection = selections[0];

    let env = {
      root: selection,
    };

    // let init = remote.require('./build/commands/init');
    // let result = init.runAsync(env, {});

    // We'll do a `force` here since if you explicitly choose
    // a directory from a GUI, you probably mean to overwrite
    // whatever is in it, I think
    await Exp.createNewExpAsync(env.root, {}, {force: true});

    return env;
  },

  async openExpAsync() {
    let selections = await showOpenDialog({
      properties: ['openDirectory'],
    });

    // console.log("selections=", selections);

    if (selections == null) {
      console.log("No selections; cancelled Open Exp");
      return null;
    }

    let selection = selections[0];

    let env = {
      root: selection,
    };

    return env;
  },
};
