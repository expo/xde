'use strict';

module.exports = {
  'new': function _new() {
    console.log("New");
    require('remote').require('dialog').showOpenDialog({
      properties: ['openDirectory', 'createDirectory']
    }, function (fileNames) {

      if (fileNames == null) {
        console.log("New article cancelled");
        return;
      }

      var fileName = fileNames[0];

      var env = {
        root: fileName
      };

      var init = require('remote').require('./build/commands/init');
      init.runAsync(env, {}).then(function () {
        console.log("Successfully created a new project");
        var runPackager = require('remote').require('./build/commands/runPackager');
        runPackager.runAsync(env, {}).then(function () {
          console.log("Successfully started packager");

          // Close this window since we don't need it anymore
          require('remote').getCurrentWindow().close();
        }, function (err) {
          console.error("Failed to start packager");
          console.error(err);
          // TODO: Show an error message to the user
        });
      }, function (err) {
        console.error("Didn't initialize!");
        console.error(err.message);
        // TODO: Show an error message to the user
      });
    });
  },

  open: function open() {
    console.log("Open");
    require('remote').require('dialog').showOpenDialog({
      properties: ['openDirectory']
    }, function (selections) {

      if (!selections) {
        console.log("No directory selected");
        return;
      }

      var selection = selections[0];
      var env = {
        root: selection
      };
      var runPackager = require('remote').require('./build/commands/runPackager');
      runPackager.runAsync(env, {}).then(function (pc) {
        console.log("runAsync complete");
        var url = pc.getUrlAsync();
        console.log(url);
      });
    });
  }

};
//# sourceMappingURL=../sourcemaps/web/Commands.js.map