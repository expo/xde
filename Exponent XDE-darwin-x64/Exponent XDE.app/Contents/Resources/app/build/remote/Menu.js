'use strict';

function newMenu() {
  // let remote = require('remote');
  var Menu = require('menu');
  var MenuItem = require('menu-item');

  var menu = new Menu();
  menu.append(new MenuItem({ label: 'MenuItem1', click: function click() {
      console.log('item 1 clicked');
    } }));
  menu.append(new MenuItem({ type: 'separator' }));
  menu.append(new MenuItem({ label: 'MenuItem2', type: 'checkbox', checked: true }));

  // Menu.setApplicationMenu(menu);

  return menu;
}

module.exports = {
  newMenu: newMenu
};
//# sourceMappingURL=../sourcemaps/remote/Menu.js.map