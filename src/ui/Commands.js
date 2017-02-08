import { remote } from 'electron';

async function showOpenDialog(opts) {
  return new Promise((fulfill, reject) => {
    let { dialog } = remote;
    dialog.showOpenDialog(opts, (selections) => {
      fulfill(selections);
    });
  });
}

export default {
  async getDirectoryAsync(currentDirectory) {
    let selections = await showOpenDialog({
      defaultPath: currentDirectory,
      properties: ['openDirectory', 'createDirectory'],
    });

    if (selections == null) {
      return null;
    }

    return selections[0];
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
