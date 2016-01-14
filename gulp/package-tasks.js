import 'instapromise';

import electronPackager from 'electron-packager';
import logger from 'gulplog';
import path from 'path';
import semver from 'semver';
import jsonFile from '@exponent/json-file';
import spawnAsync from '@exponent/spawn-async';

import {
  APP_NAME,
  APP_BUNDLE_ID,
  CODE_SIGNING_IDENTITY,
  NODE_VERSION,
  XDE_ROOT,
} from './app-configuration';

const PLATFORM = 'darwin';
const ARCH = 'x64';

let tasks = {
  async packageSignedApp() {
    return await packageAppAsync(true);
  },

  async packageUnsignedApp() {
    return await packageAppAsync(false);
  },

  async compressApp() {
    await spawnAsync('zip', ['-r', `${APP_NAME}.zip`, `${APP_NAME}.app`], {
      stdio: 'inherit',
      cwd: getOutputDirectory(),
    });
  },
};

async function checkNodeVersion() {
  if (!semver.eq(process.version, NODE_VERSION)) {
    throw new Error(`This version of Electron includes Node ${NODE_VERSION}.` +
      `In order to ensure binary compatibility please install the npm ` +
      `dependencies with Node ${process.version}.`
    );
  }
}

async function packageAppAsync(signed) {
  checkNodeVersion();

  let electronVersion = await getElectronVersionAsync();
  let iconPath = path.join(XDE_ROOT, 'dev', 'Design', 'xde.icns');

  let appPath = await electronPackager.promise({
    dir: path.resolve(__dirname, '..'),
    name: APP_NAME,
    platform: PLATFORM,
    arch: ARCH,
    version: electronVersion,
    'app-bundle-id': APP_BUNDLE_ID,
    icon: iconPath,
    ignore: [/^\/src(\/|$)/, /^\/\.babelrc$/],
    overwrite: true,
    prune: true,
    sign: signed ? CODE_SIGNING_IDENTITY : null
  });

  logger.info(`Packaged ${signed ? 'signed' : 'unsigned'} app at ${appPath}`);
  return appPath;
}

async function getElectronVersionAsync() {
  let electronPackageJsonFile = jsonFile(
    path.join(XDE_ROOT, 'node_modules', 'electron-prebuilt', 'package.json')
  );
  return await electronPackageJsonFile.getAsync('version');
}

function getOutputDirectory() {
  return path.join(XDE_ROOT, `${APP_NAME}-${PLATFORM}-${ARCH}`);
}

export default tasks;
