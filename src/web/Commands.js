
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
    let dialog = require('remote').require('dialog');
    let selections = await showOpenDialog({
      properties: ['openDirectory'],
    });

    console.log("zzz");

    if (selections == null) {
      console.log("No selections; cancelled Open Exp");
    }

    let selection = selections[0];

    console.log("selection=" + selection);

    let env = {
      root: selection,
    };
    return env;
  },

  new: function () {
    console.log("New");
    require('remote').require('dialog').showOpenDialog({
      properties: ['openDirectory', 'createDirectory'],
    }, function (fileNames) {

      if (fileNames == null) {
        console.log("New article cancelled");
        return;
      }

      let fileName = fileNames[0];

      let env = {
        root: fileName,
      };

      let init = require('remote').require('./build/commands/init');
      init.runAsync(env, {}).then(() => {
        console.log("Successfully created a new project");
        let runPackager = require('remote').require('./build/commands/runPackager');
        runPackager.runAsync(env, {}).then(() => {
          console.log("Successfully started packager");

          // Close this window since we don't need it anymore
          require('remote').getCurrentWindow().close();

        }, (err) => {
          console.error("Failed to start packager");
          console.error(err);
          // TODO: Show an error message to the user
        });
      }, (err) => {
        console.error("Didn't initialize!");
        console.error(err.message);
        // TODO: Show an error message to the user
      });
    });

  },

  open: function () {
    console.log("Open");
    require('remote').require('dialog').showOpenDialog({
      properties: ['openDirectory'],
    }, (selections) => {

      if (!selections) {
        console.log("No directory selected");
        return;
      }

      let selection = selections[0];
      let env = {
        root: selection,
      };
      let runPackager = require('remote').require('./build/commands/runPackager');
      runPackager.runAsync(env, {}).then((pc) => {
        console.log("runAsync complete");
        let url = pc.getUrlAsync();
        console.log(url);
      });
    });
  },



};
