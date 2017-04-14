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

      logger.info(
        `Rebuilding native Node modules for Electron ${electronVersion}...`
      );
      await _markDtraceProviderForRebuildAsync();
      await rebuild(
        path.resolve(paths.app),
        electronVersion,
        /* arch */ undefined,
        /* extraModules */ undefined,
        force
      );
    };
  },

  icon() {
    let contentsPath = path.dirname(path.dirname(electron));
    let resourcesPath = path.join(contentsPath, 'Resources');
    return gulp
      .src(paths.macIcon)
      .pipe(rename('electron.icns'))
      .pipe(gulp.dest(resourcesPath));
  },

  clean(done) {
    rimraf(paths.build, done);
  },
};

/**
 * electron-rebuild searches for binding.gyp but dtrace-provider names its file
 * compile.py instead. This is a workaround to rebuild the native modules in
 * dtrace-provider.
 */
async function _markDtraceProviderForRebuildAsync() {
  let dtraceProviderPath = path.resolve(
    paths.app,
    'node_modules',
    'dtrace-provider'
  );
  let packageExists = await isDirectoryAsync(dtraceProviderPath);
  if (!packageExists) {
    logger.warn(
      `We couldn't find the dtrace-provider package and won't try to rebuild its native modules for Electron`
    );
  }
  await copyFileAsync(
    path.join(dtraceProviderPath, 'compile.py'),
    path.join(dtraceProviderPath, 'binding.gyp')
  );
}

async function copyFileAsync(source, target) {
  return new Promise(function(resolve, reject) {
    let input = fs.createReadStream(source);
    let output = fs.createWriteStream(target);

    let cleanup = error => {
      input.destroy();
      output.end();
      reject(error);
    };

    input.on('error', cleanup);
    output.on('error', cleanup);
    output.on('finish', resolve);

    input.pipe(output);
  });
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
