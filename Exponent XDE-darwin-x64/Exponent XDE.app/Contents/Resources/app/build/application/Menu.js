'use strict';

function setupMenu(appComponent) {
  var remote = require('remote');
  var Menu = remote.require('menu');
  var MenuItem = remote.require('menu-item');

  var menu = new Menu({
    label: 'Exponent XDE'
  });
  menu.append(new MenuItem({
    label: 'New Project',
    click: function click() {
      console.log("New Project clicked");
      appComponent._logMetaMessage("New Project Clicked");
    },
    role: 'close'
  }));

  menu.append(new MenuItem({
    label: 'Item2',
    accelerator: 'Command+2',
    selector: 'selectAll:'
  }));

  Menu.setApplicationMenu(menu);

  return menu;
}

module.exports = {
  setupMenu: setupMenu
};
//# sourceMappingURL=../sourcemaps/application/Menu.js.map