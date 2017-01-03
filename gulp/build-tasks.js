import 'instapromise';

import electron from 'electron';
import rebuild from 'electron-rebuild';
import fs from 'fs';
import gulp from 'gulp';
import rename from 'gulp-rename';
import logger from 'gulplog';
import path from 'path';
import rimraf from 'rimraf';
import spawnAsync from '@exponent/spawn-async';

const paths = {
  source: {
    js: 'src/**/*.js',
  },
  app: 'app',
  build: 'app/build',
  macIcon: 'build/icon.icns',
};

let tasks = {
  buildNativeModules(force = false) {
    return async function buildNativeModules() {
      let versionResult = await spawnAsync(electron, ['--version']);
      let electronVersion = /v(\d+\.\d+\.\d+)/.exec(versionResult.stdout)[1];

      logger.info(`Rebuilding native Node modules for Electron ${electronVersion}...`);
      await rebuild(
        path.resolve(paths.app),
        electronVersion,
        /* arch */ undefined,
        /* extraModules */ undefined,
        force,
      );
    };
  },

  icon() {
    let contentsPath = path.dirname(path.dirname(electron));
    let resourcesPath = path.join(contentsPath, 'Resources');
    return gulp.src(paths.macIcon)
      .pipe(rename('electron.icns'))
      .pipe(gulp.dest(resourcesPath));
  },

  clean(done) {
    rimraf(paths.build, done);
  },
};

async function hasNodeHeadersAsync(electronVersion) {
  let baseHeadersPath = path.join(
    path.dirname(require.resolve('electron-rebuild')),
    'headers',
    '.node-gyp',
  );
  let nodeHeadersPath = path.join(baseHeadersPath, electronVersion);
  let iojsHeadersPath = path.join(baseHeadersPath, `iojs-${electronVersion}`);

  let [nodeHeadersExist, iojsHeadersExist] = await Promise.all([
    isDirectoryAsync(nodeHeadersPath),
    isDirectoryAsync(iojsHeadersPath),
  ]);
  return nodeHeadersExist || iojsHeadersExist;
}

async function isDirectoryAsync(directoryPath) {
  try {
    let stats = await fs.promise.stat(directoryPath);
    return stats.isDirectory();
  } catch (e) {
    if (e.code !== 'ENOENT') {
      throw e;
    }
    return false;
  }
}

export default tasks;
