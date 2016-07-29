import gulp from 'gulp';

import buildTasks from './gulp/build-tasks';

let tasks = {
  ...buildTasks,
};

gulp.task('build:deploy', tasks.babel);
gulp.task('build', gulp.parallel(tasks.buildNativeModules, tasks.babel));
gulp.task('watch', gulp.parallel(
  tasks.buildNativeModules,
  gulp.series(tasks.babel, tasks.watchBabel),
));
gulp.task('clean', tasks.clean);
