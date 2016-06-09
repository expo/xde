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

    let projectRoot = selections[0];
    // let init = remote.require('./build/commands/init');
    // let result = init.runAsync(env, {});

    // We'll do a `force` here since if you explicitly choose
    // a directory from a GUI, you probably mean to overwrite
    // whatever is in it, I think
    await Exp.createNewExpAsync(projectRoot, {}, {force: true});

    return projectRoot;
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

    let projectRoot = selections[0];
    return projectRoot;
  },
};
