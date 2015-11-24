import 'instapromise';

import fs from 'fs-extra';
import gulp from 'gulp';
import logger from 'gulplog';
import path from 'path';
import crayon from '@ccheever/crayon'

import { APP_NAME, XDE_ROOT } from './app-configuration';

let tasks = {
  async postInstall() {
    let appRoot = path.join(
      XDE_ROOT,
      'node_modules/electron-prebuilt/dist/Electron.app'
    );
    let xdeIconsPath = path.join(XDE_ROOT, 'dev/Design/xde.icns');
    let appIconsPath = path.join(appRoot, 'Contents/Resources/atom.icns');
    try {
      await fs.promise.copy(xdeIconsPath, appIconsPath);
      logger.info(crayon.green('Copied icons into electron-prebuilt'));
    } catch (error) {
      logger.error('Failed to copy icons into electron-prebuilt');
      logger.error(error.stack);
    }
  },
};

export default tasks;
