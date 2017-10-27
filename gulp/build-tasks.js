import electron from 'electron';
import rebuild from 'electron-rebuild';
import gulp from 'gulp';
import rename from 'gulp-rename';
import logger from 'gulplog';
import path from 'path';
import rimraf from 'rimraf';
import spawnAsync from '@expo/spawn-async';

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

export default tasks;
