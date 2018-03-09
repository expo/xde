import fs from 'fs';
import mkdirp from 'mkdirp';
import path from 'path';
import promisify from 'util.promisify';
import spawnAsync from '@expo/spawn-async';
import sudo from 'sudo-prompt';

import { Binaries, ErrorCode, Logger, NotificationCode, UserSettings, Utils, XDLError } from 'xdl';

const sudoAsync = promisify(sudo.exec);
const sudoOptions = {
  name: 'Expo XDE',
};
const INSTALL_PATH = '/usr/local/bin';

export async function installShellCommandsAsync() {
  if (process.platform !== 'darwin') {
    throw new XDLError(ErrorCode.PLATFORM_NOT_SUPPORTED, 'Platform not supported.');
  }

  await Binaries.sourceBashLoginScriptsAsync();
  await _copyBinariesToExpoDirAsync();

  let binaries = ['adb', 'watchman', 'xde'];
  let installedBinaries = [];
  let commands = [];
  for (let i = 0; i < binaries.length; i++) {
    let name = binaries[i];
    if (!await _binaryInstalledAsync(name) && !await _binaryExistsAsync(name)) {
      installedBinaries.push(name);
      commands.push(
        `rm -f ${path.join(INSTALL_PATH, name)};`,
        `mkdir -p ${INSTALL_PATH};`,
        `ln -s ${path.join(_expoBinaryDirectory(), name, name)} ${path.join(INSTALL_PATH, name)};`
      );
    }
  }

  if (installedBinaries.length === 0) {
    Logger.notifications.warn(
      { code: NotificationCode.INSTALL_SHELL_COMMANDS_RESULT },
      `Shell commands ${binaries.join(', ')} are already installed`
    );
    return;
  }

  try {
    await sudoAsync(commands.join('\n'), sudoOptions);
  } catch (e) {
    Logger.notifications.error(
      { code: NotificationCode.INSTALL_SHELL_COMMANDS_RESULT },
      'Error installing shell commands'
    );
    throw e;
  }
  Logger.notifications.info(
    { code: NotificationCode.INSTALL_SHELL_COMMANDS_RESULT },
    `Installed ${installedBinaries.join(', ')} to your shell`
  );
}

async function _copyBinariesToExpoDirAsync() {
  await Utils.ncpAsync(Binaries.OSX_SOURCE_PATH, _expoBinaryDirectory());
}

async function _binaryInstalledAsync(name) {
  try {
    let result = await spawnAsync('which', [name]);
    // We add watchman to PATH when starting packager, so make sure we're not using that version
    return (
      result.stdout && result.stdout.length > 1 && !result.stdout.includes(Binaries.OSX_SOURCE_PATH)
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
