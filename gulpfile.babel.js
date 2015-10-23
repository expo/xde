import gulp from 'gulp';

import buildTasks from './gulp/build-tasks';
import launchTasks from './gulp/launch-tasks';

let tasks = {
  ...buildTasks,
  ...launchTasks,
};

gulp.task('build', tasks.babel);
gulp.task('watch', gulp.series(tasks.babel, tasks.watchBabel));
gulp.task(tasks.clean);
gulp.task('run', tasks.launch);
gulp.task('default', gulp.series('clean', 'watch', 'run'));
