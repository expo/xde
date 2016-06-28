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
  async newExpAsync(name) {
    let selections = await showOpenDialog({
      properties: ['openDirectory', 'createDirectory'],
    });

    if (selections == null) {
      console.log("No selections; cancelled New Exp");
      return null;
    }

    let selectedDir = selections[0];
    let root = await Exp.createNewExpAsync(selectedDir, {}, {name});

    return root;
  },

  async openExpAsync() {
    let selections = await showOpenDialog({
      properties: ['openDirectory'],
    });

    if (selections == null) {
      console.log("No selections; cancelled Open Exp");
      return null;
    }

    let projectRoot = selections[0];
    return projectRoot;
  },
};
