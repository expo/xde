
async function showOpenDialog(opts) {
  return new Promise((fulfill, reject) => {
    let dialog = require('remote').require('dialog');
    dialog.showOpenDialog(opts, function (selections) {
      fulfill(selections);
    });
  });
}

module.exports = {

  newExpAsync: async function () {

    let dialog = require('remote').require('dialog');
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

    let init = require('remote').require('./build/commands/init');
    let result = init.runAsync(env, {});

    return env;

  },

  openExpAsync: async function () {
    console.log(1);
    let dialog = require('remote').require('dialog');
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
