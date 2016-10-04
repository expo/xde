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

gulp.task('build:deploy', tasks.babel);
gulp.task('build', gulp.parallel(
  tasks.buildNativeModules,
  tasks.babel,
  tasks.icon,
));
gulp.task('watch', gulp.parallel(
  tasks.buildNativeModules,
  gulp.series(tasks.babel, tasks.watchBabel),
  tasks.icon,
));
gulp.task('release', gulp.series(
  tasks.clean,
  tasks.babel,
  getReleaseTask(['mac', 'win']),
  tasks.verifyMacApp,
));
gulp.task('release:mac', gulp.series(
  tasks.clean,
  tasks.babel,
  getReleaseTask(['mac']),
  tasks.verifyMacApp,
));
gulp.task('release:windows', gulp.series(
  tasks.clean,
  tasks.babel,
  getReleaseTask(['win']),
));
gulp.task('clean', tasks.clean);
