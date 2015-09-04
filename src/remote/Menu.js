function newMenu() {
  // let remote = require('remote');
  let Menu = require('menu');
  let MenuItem = require('menu-item');

  let menu = new Menu();
  menu.append(new MenuItem({ label: 'MenuItem1', click: function() { console.log('item 1 clicked'); } }));
  menu.append(new MenuItem({ type: 'separator' }));
  menu.append(new MenuItem({ label: 'MenuItem2', type: 'checkbox', checked: true }));

  // Menu.setApplicationMenu(menu);

  return menu;

}

module.exports = {
  newMenu,
};
