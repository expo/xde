let path = require('path');
let execSync = require('child_process').execSync;

if (process.env.HOT) {
  execSync('npm run webpack-hot', {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
  });
} else {
  execSync('npm run webpack-dev', {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
  });
}
