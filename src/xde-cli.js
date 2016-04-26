#!/usr/bin/env node

import child_process from 'child_process';
import path from 'path';
import promisePrint from 'promise-print';
import spawnAsync from '@exponent/spawn-async';

let executable = path.resolve(__dirname, '../node_modules/.bin/electron');
let electronAppRoot = path.resolve(__dirname, '..');

// We can't do `export default` here or else `xdeAsync` won't be defined below
async function xdeAsync() {
  let jsonArgs = JSON.stringify(process.argv.slice(2));
  // console.log("Running XDE with args:", jsonArgs);
  return child_process.spawn(executable, [electronAppRoot], {
    env: {
      ...process.env,
      // XDE_NPM_START: 1,
      XDE_CMD_LINE_ARGS: jsonArgs,
      XDE_CMD_LINE_CWD: process.cwd(),
    },
    detached: true,
    stdio: 'ignore',
    // stdio: 'inherit',
  });
}

export default xdeAsync;

if (require.main === module) {
  promisePrint(xdeAsync().then(() => {
    process.exit(0);
  }));
}
