import child_process from 'child_process';
import gulp from 'gulp';
import logger from 'gulplog';

let tasks = {
  launch(done) {
    child_process.exec('npm start', {
      cwd: __dirname,
    }, (error, stdout, stderr) => {
      if (error) {
        logger.error(error);
      }
      done();
    });
  },
};

export default tasks;
