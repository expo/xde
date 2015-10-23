import gulp from 'gulp';

import buildTasks from './gulp/build-tasks';
import launchTasks from './gulp/launch-tasks';
import packageTasks from './gulp/package-tasks';
import postInstallTasks from './gulp/postinstall-tasks';

let tasks = {
  ...buildTasks,
  ...launchTasks,
  ...packageTasks,
  ...postInstallTasks,
};

gulp.task('build', tasks.babel);
gulp.task('watch', gulp.series(tasks.babel, tasks.watchBabel));
gulp.task('clean', tasks.clean);

gulp.task('postinstall', tasks.postInstall);
gulp.task('run', tasks.launch);

gulp.task('default', gulp.series('clean', 'watch', 'run'));
