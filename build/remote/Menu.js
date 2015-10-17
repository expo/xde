'use strict';

var BrowserWindow = require('browser-window');
var Menu = require('menu');

function setupMenu() {
  // return;
  var template = [
  // {
  //   label: 'Bieber',
  //   submenu: [
  //     {
  //       label: 'What do you do?',
  //     },
  //     {
  //       label: 'Never say never',
  //     },
  //   ],
  // },
  {
    label: 'Electron',
    submenu: [{
      label: 'About Electron',
      selector: 'orderFrontStandardAboutPanel:'
    }, {
      type: 'separator'
    }, {
      label: 'Services',
      submenu: []
    }, {
      type: 'separator'
    }, {
      label: 'Hide Electron',
      accelerator: 'Command+H',
      selector: 'hide:'
    }, {
      label: 'Hide Others',
      accelerator: 'Command+Shift+H',
      selector: 'hideOtherApplications:'
    }, {
      label: 'Show All',
      selector: 'unhideAllApplications:'
    }, {
      type: 'separator'
    }, {
      label: 'Quit',
      accelerator: 'Command+Q',
      selector: 'terminate:'
    }]
  }, {
    label: 'Edit',
    submenu: [{
      label: 'Undo',
      accelerator: 'Command+Z',
      selector: 'undo:'
    }, {
      label: 'Redo',
      accelerator: 'Shift+Command+Z',
      selector: 'redo:'
    }, {
      type: 'separator'
    }, {
      label: 'Cut',
      accelerator: 'Command+X',
      selector: 'cut:'
    }, {
      label: 'Copy',
      accelerator: 'Command+C',
      selector: 'copy:'
    }, {
      label: 'Paste',
      accelerator: 'Command+V',
      selector: 'paste:'
    }, {
      label: 'Select All',
      accelerator: 'Command+A',
      selector: 'selectAll:'
    }]
  }, {
    label: 'View',
    submenu: [{
      label: 'Reload',
      accelerator: 'Command+R',
      click: function click() {
        BrowserWindow.getFocusedWindow().reload();
      }
    }, {
      label: 'Toggle DevTools',
      accelerator: 'Alt+Command+I',
      click: function click() {
        BrowserWindow.getFocusedWindow().toggleDevTools();
      }
    }]
  }, {
    label: 'Window',
    submenu: [{
      label: 'Minimize',
      accelerator: 'Command+M',
      selector: 'performMiniaturize:'
    }, {
      label: 'Close',
      accelerator: 'Command+W',
      selector: 'performClose:'
    }, {
      type: 'separator'
    }, {
      label: 'Bring All to Front',
      selector: 'arrangeInFront:'
    }]
  }, {
    label: 'Help',
    submenu: []
  }];

  var menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

module.exports = {
  setupMenu: setupMenu
};
//# sourceMappingURL=../sourcemaps/remote/Menu.js.map
