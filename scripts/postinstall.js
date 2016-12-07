let path = require('path');
let execSync = require('child_process').execSync;

execSync('yarn', {
  cwd: path.join(__dirname, '..', 'app'),
  stdio: 'inherit',
});

execSync('npm run build', {
  cwd: path.join(__dirname, '..'),
  stdio: 'inherit',
});
