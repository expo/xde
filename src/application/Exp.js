let jsonFile = require('@exponent/json-file');
let existsAsync = require('exists-async');
let fs = require('fs');
let fsExtra = require('fs-extra');
let mkdirp = require('mkdirp');
let path = require('path');

let userSettings = require('./userSettings');

let TEMPLATE_ROOT = path.resolve(path.join(__dirname, '../../template'));

function NewExpError(code, message) {
  let err = new Error(message);
  err.code = code;
  err._isNewExpError;
  return err;
}

async function determineEntryPoint(root) {
  let pkgJson = jsonFile(path.join(root, 'package.json'));
  let main = await pkgJson.getAsync('main', 'index.js');
  // console.log("main=", main);
  return main;
}

async function createNewExpAsync(root, info, opts) {

  let pp = path.parse(root);
  let name = pp.name;

  // opts = opts || {force: true};
  opts = opts || {};

  let author = await userSettings.getAsync('email', undefined);

  let data = Object.assign({
    name,
    version: '0.0.0',
    description: "Hello Exponent!",
    main: 'main.js',
    author,
    //license: "MIT",
    // scripts: {
    //   "test": "echo \"Error: no test specified\" && exit 1"
    // },
  }, info);

  let pkgJson = jsonFile(path.join(root, 'package.json'));

  let exists = await existsAsync(pkgJson.file);
  if (exists && !opts.force) {
    throw NewExpError('WONT_OVERWRITE_WITHOUT_FORCE', "Refusing to create new Exp because package.json already exists at root");
  }

  await mkdirp.promise(root);

  let result = await pkgJson.writeAsync(data);

  await fsExtra.promise.copy(TEMPLATE_ROOT, root);

  // Custom code for replacing __NAME__ in main.js
  let mainJs = await fs.readFile.promise(path.join(TEMPLATE_ROOT, 'main.js'), 'utf8');
  let customMainJs = mainJs.replace(/__NAME__/g, data.name);
  result = await fs.writeFile.promise(path.join(root, 'main.js'), customMainJs, 'utf8');

  return data;

}

module.exports = {
  determineEntryPoint,
  createNewExpAsync,
};
