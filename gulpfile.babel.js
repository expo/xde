import gulp from 'gulp';

import buildTasks from './gulp/build-tasks';

let tasks = {
  ...buildTasks,
};

gulp.task('build', tasks.babel);
gulp.task('watch', gulp.series(tasks.babel, tasks.watchBabel));
gulp.task('clean', tasks.clean);
