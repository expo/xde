import gulp from 'gulp';
import path from 'path';
import process from 'process';
import spawnAsync from '@exponent/spawn-async';

import buildTasks from './gulp/build-tasks';
import verificationTasks from './gulp/verification-tasks';

let tasks = {
  ...buildTasks,
  ...verificationTasks,
};

function getReleaseTask(platforms) {
  return function release() {
    let args = platforms.map(platform => `--${platform}`);
    let nodeBinPath = path.resolve(__dirname, 'node_modules/.bin');
    return spawnAsync('build', args, {
      env: {
        ...process.env,
        PATH: `${nodeBinPath}${path.delimiter}${process.env.PATH}`,
      },
      stdio: 'inherit',
    });
  };
}

gulp.task('rebuild', gulp.parallel(
  tasks.buildNativeModules(),
  tasks.icon,
));
gulp.task('rebuild:force', gulp.parallel(
  tasks.buildNativeModules(true),
  tasks.icon,
));
gulp.task('release', gulp.series(
  getReleaseTask(['mac', 'win', 'linux']),
  tasks.verifyMacApp,
));
gulp.task('release:mac', gulp.series(
  getReleaseTask(['mac']),
  tasks.verifyMacApp,
));
gulp.task('release:windows', getReleaseTask(['win']));
gulp.task('release:linux', getReleaseTask(['linux']));
gulp.task('clean', tasks.clean);
