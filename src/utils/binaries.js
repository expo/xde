import fs from 'fs';
import mkdirp from 'mkdirp';
import path from 'path';
import spawnAsync from '@expo/spawn-async';

import {
  Binaries,
  ErrorCode,
  Logger,
  NotificationCode,
  UserSettings,
  Utils,
  XDLError,
} from 'xdl';
let runas = null; // defer until used

const INSTALL_PATH = '/usr/local/bin';

export async function installShellCommandsAsync() {
  await Binaries.sourceBashLoginScriptsAsync();
  await _copyBinariesToExpoDirAsync();

  let binaries = ['adb', 'watchman', 'xde'];
  let installedBinaries = [];
  for (let i = 0; i < binaries.length; i++) {
    if (await _installBinaryAsync(binaries[i])) {
      installedBinaries.push(binaries[i]);
    }
  }

  if (installedBinaries.length === 0) {
    Logger.notifications.warn(
      { code: NotificationCode.INSTALL_SHELL_COMMANDS_RESULT },
      `Shell commands ${binaries.join(', ')} are already installed`
    );
  } else {
    Logger.notifications.info(
      { code: NotificationCode.INSTALL_SHELL_COMMANDS_RESULT },
      `Installed ${installedBinaries.join(', ')} to your shell`
    );
  }
}

// Only called on darwin
async function _installBinaryAsync(name) {
  if ((await _binaryInstalledAsync(name)) || (await _binaryExistsAsync(name))) {
    return false;
  }

  try {
    if (!runas) {
      runas = require('runas');
    }

    // adb lives at ~/.expo/adb/adb
    try {
      runas('/bin/rm', ['-f', path.join(INSTALL_PATH, name)], { admin: true });
    } catch (e) {
      // Don't worry if we can't rm the file, we'll just get an error later
    }

    if (runas('/bin/mkdir', ['-p', INSTALL_PATH], { admin: true }) !== 0) {
      throw new Error(`Could not run \`mkdir -p ${INSTALL_PATH}\`.`);
    }

    if (
      runas(
        '/bin/ln',
        [
          '-s',
          path.join(_expoBinaryDirectory(), name, name),
          path.join(INSTALL_PATH, name),
        ],
        { admin: true }
      ) !== 0
    ) {
      throw new Error(`Could not symlink \`${name}\`.`);
    }

    return true;
  } catch (e) {
    Logger.notifications.error(
      { code: NotificationCode.INSTALL_SHELL_COMMANDS_RESULT },
      `Error installing ${name}: ${e.message}`
    );
    throw e;
  }
}

async function _copyBinariesToExpoDirAsync() {
  if (process.platform !== 'darwin') {
    throw new XDLError(
      ErrorCode.PLATFORM_NOT_SUPPORTED,
      'Platform not supported.'
    );
  }

  await Utils.ncpAsync(Binaries.OSX_SOURCE_PATH, _expoBinaryDirectory());
}

async function _binaryInstalledAsync(name) {
  try {
    let result = await spawnAsync('which', [name]);
    // We add watchman to PATH when starting packager, so make sure we're not using that version
    return (
      result.stdout &&
      result.stdout.length > 1 &&
      !result.stdout.includes(Binaries.OSX_SOURCE_PATH)
    );
  } catch (e) {
    console.log(e.toString());
    return false;
  }
}

// Sometimes `which` fails mysteriously, so try to just look for the file too.
async function _binaryExistsAsync(name) {
  try {
    if (fs.lstatSync(path.join(INSTALL_PATH, name)).isSymbolicLink()) {
      return true;
    }

    return false;
  } catch (e) {
    return false;
  }
}

function _expoBinaryDirectory() {
  let dotExpoHomeDirectory = UserSettings.dotExpoHomeDirectory();
  let dir = path.join(dotExpoHomeDirectory, 'bin');
  mkdirp.sync(dir);
  return dir;
}
