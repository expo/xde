import assert from 'assert';
import path from 'path';
import spawnAsync from '@exponent/spawn-async';

const appPackage = require('../app/package.json');

const paths = {
  macApp: `dist/mac/${appPackage.productName}.app`,
};

const macCodeSigningAuthorities = [
  'Developer ID Application: 650 Industries, Inc. (C8D8QTF339)',
  'Developer ID Certification Authority',
  'Apple Root CA',
];

let tasks = {
  verifyMacApp() {
    return Promise.all([
      verifyCodeSignatureAsync(paths.macApp),
      verifyCodeSigningAuthorityAsync(paths.macApp),
      assessWithSystemPolicyAsync(paths.macApp),
    ]);
  },
};

async function verifyCodeSignatureAsync(appPath) {
  try {
    // codesign returns a non-zero exit code if verification fails
    await spawnAsync('codesign', [
      '--verify',
      '--deep',
      '--strict',
      appPath,
    ]);
  } catch (e) {
    let error = new Error(
      `Could not verify code signature of the Mac app:\n` + e.stderr
    );
    error.cause = e;
    throw error;
  }
}

async function verifyCodeSigningAuthorityAsync(appPath) {
  let authorities = [];
  try {
    let result = await spawnAsync('codesign', [
      '--display',
      '--verbose=2',
      appPath,
    ]);
    let match;
    let regex = /^Authority=(.*)$/gm;
    // codesign writes to stderr
    while ((match = regex.exec(result.stderr))) {
      authorities.push(match[1]);
    }
  } catch (e) {
    let error = new Error(
      `Could not read the code signature of the Mac app:\n` + e.stderr
    );
    error.cause = e;
    throw error;
  }

  assert.deepEqual(authorities, macCodeSigningAuthorities);
}

async function assessWithSystemPolicyAsync(appPath) {
  let result;
  try {
    result = await spawnAsync('spctl', ['--assess', '--verbose', appPath]);
  } catch (e) {
    let error = new Error(
      `Could not assess whether the Mac app's signature meets Gatekeeper ` +
      `requirements:\n` + e.stderr
    );
    error.cause = e;
    throw error;
  }

  let appFilename = path.basename(appPath);
  if (result.stderr.indexOf(`${appFilename}: accepted`) === -1) {
    throw new Error(
      `Mac app does not meet Gatekeeper requirements:\n${result.stderr}`
    );
  }
}

export default tasks;
