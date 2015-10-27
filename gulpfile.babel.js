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

gulp.task('package', tasks.packageSignedApp);
gulp.task('unsigned-package', tasks.packageUnsignedApp);

gulp.task('release', gulp.series(
  tasks.packageSignedApp,
  tasks.compressApp
));
gulp.task('unsigned-release', gulp.series(
  tasks.packageUnsignedApp,
  tasks.compressApp
));

gulp.task('default', gulp.series('watch', 'run'));
