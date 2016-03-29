import 'instapromise';

import JsonFile from '@exponent/json-file';

import electronPackager from 'electron-packager';
import logger from 'gulplog';
import path from 'path';
import spawnAsync from '@exponent/spawn-async';

import {
  APP_NAME,
  APP_BUNDLE_ID,
  CODE_SIGNING_IDENTITY,
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
    let xdePackageJson = new JsonFile(path.join(XDE_ROOT, 'package.json'));
    let xdeVersion = await xdePackageJson.getAsync('version');
    await spawnAsync('zip', ['-rqy9', `Exponent-XDE-osx-${xdeVersion}.zip`, `${APP_NAME}.app`], {
      stdio: 'inherit',
      cwd: getOutputDirectory(),
    });
  },
};

async function checkNativeModulesVersionAsync() {
  let localModulesVersion = process.versions.modules;
  let electronModulesVersion = await getElectronModulesVersionAsync();
  if (localModulesVersion !== electronModulesVersion) {
    throw new Error(`The copy of Node included with Electron uses native ` +
      `modules of version ${electronModulesVersion} but this version of Node ` +
      `uses native modules of version ${localModulesVersion}. In order to ` +
      'ensure binary compatibility please install the npm packages with a ' +
      `version of Node whose native modules are of version ` +
      `${electronModulesVersion}.`
    );
  }
}

async function packageAppAsync(signed) {
  await checkNativeModulesVersionAsync();

  let [xdeVersion, electronVersion] = await Promise.all([
    JsonFile.getAsync(path.join(XDE_ROOT, 'package.json'), 'version'),
    getElectronVersionAsync(),
  ]);
  let iconPath = path.join(XDE_ROOT, 'dev', 'Design', 'xde.icns');

  let appPath = await electronPackager.promise({
    dir: path.resolve(__dirname, '..'),
    name: APP_NAME,
    platform: PLATFORM,
    arch: ARCH,
    version: electronVersion,
    'app-bundle-id': APP_BUNDLE_ID,
    'app-copyright': `Copyright (c) ${new Date().getFullYear()} Exponent`,
    'build-version': xdeVersion,
    icon: iconPath,
    ignore: [/^\/src(\/|$)/, /^\/\.babelrc$/],
    overwrite: true,
    prune: true,
    // 'osx-sign': signed ? { identity: CODE_SIGNING_IDENTITY } : null,
    sign: signed ? CODE_SIGNING_IDENTITY : null,
  });

  logger.info(`Packaged ${signed ? 'signed' : 'unsigned'} app at ${appPath}`);
  return appPath;
}

async function getElectronVersionAsync() {
  let electronPackageJsonFile = new JsonFile(
    path.join(XDE_ROOT, 'node_modules', 'electron-prebuilt', 'package.json')
  );
  return await electronPackageJsonFile.getAsync('version');
}

async function getElectronModulesVersionAsync() {
  let electronPath = path.join(XDE_ROOT, 'node_modules', '.bin', 'electron');
  let electronResult = await spawnAsync(electronPath, [
    '--eval',
    'console.log(require("process").versions.modules)',
  ], {
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: 1,
    },
  });
  return electronResult.stdout.trim();
}

function getOutputDirectory() {
  return path.join(XDE_ROOT, `${APP_NAME}-${PLATFORM}-${ARCH}`);
}

export default tasks;
