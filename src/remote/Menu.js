import {
  BrowserWindow,
  Menu,
} from 'electron';

function _installShellCommands(window) {
  if (process.platform === 'darwin') {
    return [{
      label: 'Install Shell Commands',
      click: () => { window.webContents.send('menu-item-clicked', 'install-shell-commands'); },
    },
    {
      type: 'separator',
    }];
  } else {
    return [];
  }
}

function _installIosSimulatorApp(window, isProjectOpen) {
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
      label: 'Edit',
      submenu: [
        {
          role: 'undo',
        },
        {
          role: 'redo',
        },
        {
          type: 'separator',
        },
        {
          role: 'cut',
        },
        {
          role: 'copy',
        },
        {
          role: 'paste',
        },
        {
          role: 'selectall',
        },
      ],
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: process.platform === 'darwin' ? 'Alt+Command+R' : 'Ctrl+Shift+R',
          click: () => { BrowserWindow.getFocusedWindow().reload(); },
        },
        {
          label: 'Toggle DevTools',
          accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
          click: () => { BrowserWindow.getFocusedWindow().toggleDevTools(); },
        },
      ],
    },
    {
      label: 'Window',
      role: 'window',
      submenu: [
        {
          role: 'minimize',
        },
        {
          role: 'close',
        },
      ],
    },
    {
      label: 'Help',
      role: 'help',
      submenu: [
        {
          label: 'Expo Documentation',
          click: () => { require('electron').shell.openExternal('https://docs.expo.io/'); },
        },
      ],
    },
  ];

  if (process.platform === 'darwin') {
    template.unshift({
      label: 'Expo XDE',
      submenu: [
        {
          role: 'about',
        },
        {
          type: 'separator',
        },
        ..._installShellCommands(window),
        {
          label: 'Install Android App',
          click: () => { window.webContents.send('menu-item-clicked', 'install-android-app'); },
          enabled: isProjectOpen,
        },
        ..._installIosSimulatorApp(window, isProjectOpen),
        {
          type: 'separator',
        },
        {
          role: 'services',
          submenu: [],
        },
        {
          type: 'separator',
        },
        {
          role: 'hide',
        },
        {
          role: 'hideothers',
        },
        {
          role: 'unhide',
        },
        {
          type: 'separator',
        },
        {
          role: 'quit',
        },
      ],
    });
    // Window menu.
    template[3].submenu = [
      {
        label: 'Close',
        accelerator: 'CmdOrCtrl+W',
        role: 'close',
      },
      {
        label: 'Minimize',
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize',
      },
      {
        label: 'Zoom',
        role: 'zoom',
      },
      {
        type: 'separator',
      },
      {
        label: 'Bring All to Front',
        role: 'front',
      },
    ];
  } else {
    template.unshift({
      label: 'Expo XDE',
      submenu: [
        ..._installShellCommands(window),
        {
          label: 'Install Android App',
          click: () => { window.webContents.send('menu-item-clicked', 'install-android-app'); },
          enabled: isProjectOpen,
        },
        ..._installIosSimulatorApp(window, isProjectOpen),
      ],
    });
  }

  let menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

export default {
  setupMenu,
};
