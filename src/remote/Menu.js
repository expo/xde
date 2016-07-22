import {
  BrowserWindow,
  Menu,
} from 'electron';

function _installShellCommands(window, isProjectOpen) {
  if (process.platform === 'darwin') {
    return [{
      label: 'Install Shell Commands',
      click: () => { window.webContents.send('menu-item-clicked', 'install-shell-commands'); },
      enabled: isProjectOpen,
    },
    {
      type: 'separator',
    }];
  } else {
    return [];
  }
}

function _installIosSimulatorApp() {
  if (process.platform === 'darwin') {
    return [{
      label: 'Install iOS Simulator App',
      click: () => { window.webContents.send('menu-item-clicked', 'install-ios-simulator-app'); },
      enabled: isProjectOpen,
    }];
  } else {
    return [];
  }
}

function setupMenu(window, isProjectOpen) {
  let template = [
    {
      label: 'Exponent XDE',
      submenu: [
        {
          label: 'About XDE',
          selector: 'orderFrontStandardAboutPanel:',
        },
        {
          type: 'separator',
        },
        ..._installShellCommands(window, isProjectOpen),
        {
          label: 'Install Android App',
          click: () => { window.webContents.send('menu-item-clicked', 'install-android-app'); },
          enabled: isProjectOpen,
        },
        ..._installIosSimulatorApp(),
        {
          type: 'separator',
        },
        {
          label: 'Hide XDE',
          accelerator: 'Command+H',
          selector: 'hide:',
        },
        {
          label: 'Hide Others',
          accelerator: 'Command+Shift+H',
          selector: 'hideOtherApplications:',
        },
        {
          label: 'Show All',
          selector: 'unhideAllApplications:',
        },
        {
          type: 'separator',
        },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          selector: 'terminate:',
        },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        {
          label: 'Undo',
          accelerator: 'Command+Z',
          selector: 'undo:',
        },
        {
          label: 'Redo',
          accelerator: 'Shift+Command+Z',
          selector: 'redo:',
        },
        {
          type: 'separator',
        },
        {
          label: 'Cut',
          accelerator: 'Command+X',
          selector: 'cut:',
        },
        {
          label: 'Copy',
          accelerator: 'Command+C',
          selector: 'copy:',
        },
        {
          label: 'Paste',
          accelerator: 'Command+V',
          selector: 'paste:',
        },
        {
          label: 'Select All',
          accelerator: 'Command+A',
          selector: 'selectAll:',
        },
      ],
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'Command+R',
          click: () => { BrowserWindow.getFocusedWindow().reload(); },
        },
        {
          label: 'Toggle DevTools',
          accelerator: 'Alt+Command+I',
          click: () => { BrowserWindow.getFocusedWindow().toggleDevTools(); },
        },
      ],
    },
    {
      label: 'Window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'Command+M',
          selector: 'performMiniaturize:',
        },
        {
          label: 'Close',
          accelerator: 'Command+W',
          selector: 'performClose:',
        },
        {
          type: 'separator',
        },
        {
          label: 'Bring All to Front',
          selector: 'arrangeInFront:',
        },
      ],
    },
    {
      label: 'Help',
      submenu: [],
    },

  ];

  let menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

module.exports = {
  setupMenu,
};
