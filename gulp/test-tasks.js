import path from 'path';
import JsonFile from '@exponent/json-file';

let tasks = {
  testUpdates() {
    return async function testUpdates() {
      let packageJsonFile = new JsonFile(
        path.join(__dirname, '..', 'package.json')
      );
      let packageJson = await packageJsonFile.readAsync();
      let appPackageJsonFile = new JsonFile(
        path.join(__dirname, '..', 'app', 'package.json')
      );
      let appPackageJson = await appPackageJsonFile.readAsync();

      packageJson.build.publish = [
        {
          provider: 'github',
          owner: 'exponent',
          repo: 'xde-updates-test',
        },
      ];
      packageJson.build.appId = 'host.exp.xde-updates-test';

      appPackageJson.repository.url =
        'git+https://github.com/exponent/xde-updates-test.git';
      appPackageJson.bugs.url =
        'https://github.com/exponent/xde-updates-test/issues';
      appPackageJson.homepage =
        'https://github.com/exponent/xde-updates-test#readme';

      await packageJsonFile.writeAsync(packageJson);
      await appPackageJsonFile.writeAsync(appPackageJson);
    };
  },
};

export default tasks;
