import 'instapromise';

import electronPrebuilt from 'electron-prebuilt';
import {
  installNodeHeaders,
  rebuildNativeModules,
  shouldRebuildNativeModules,
} from 'electron-rebuild';
import fs from 'fs';
import gulp from 'gulp';
import babel from 'gulp-babel';
import changed from 'gulp-changed';
import rename from 'gulp-rename';
import sourcemaps from 'gulp-sourcemaps';
import logger from 'gulplog';
import path from 'path';
import rimraf from 'rimraf';
import spawnAsync from '@exponent/spawn-async';

const paths = {
  source: {
    js: 'src/**/*.js',
  },
  build: 'app/build',
  nodeModules: 'app/node_modules',
  macIcon: 'build/icon.icns',
};

let tasks = {
  async buildNativeModules() {
    let shouldRebuild = await shouldRebuildNativeModules(electronPrebuilt);
    if (!shouldRebuild) {
      return;
    }

    let versionResult = await spawnAsync(electronPrebuilt, ['--version']);
    let electronVersion = /v(\d+\.\d+\.\d+)/.exec(versionResult.stdout)[1];

    // When Node and Electron share the same ABI version again (discussion here:
    // https://github.com/electron/electron/issues/5851) we can remove this
    // check and rely solely on shouldRebuildNativeModules again
    let hasHeaders = await hasNodeHeadersAsync(electronVersion);
    if (hasHeaders) {
      return;
    }

    logger.info(`Rebuilding native Node modules for Electron ${electronVersion}...`);
    await installNodeHeaders(electronVersion);
    await rebuildNativeModules(electronVersion, paths.nodeModules);
  },

  babel() {
    return gulp.src(paths.source.js)
      .pipe(changed(paths.build))
      .pipe(sourcemaps.init())
      .pipe(babel())
      .pipe(sourcemaps.write('__sourcemaps__'))
      .pipe(gulp.dest(paths.build));
  },

  watchBabel(done) {
    gulp.watch(paths.source.js, tasks.babel);
    done();
  },

  icon() {
    let contentsPath = path.dirname(path.dirname(electronPrebuilt));
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
