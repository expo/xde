let path = require('path');

let packager = require('../application/packager');


module.exports = {
  runAsync: async function (env, args) {
    let pc = new packager.PackagerController({
      absolutePath: path.resolve(env.root),
      // TODO: Guess the main module path from the package.json
      // Or should that be baked into the PackagerController?
      // It probably should
    });

    pc.packagerReady$.then(() => {
      console.log("Packager Promise Ready");
    });

    pc.on('ready', () => {
      console.log("Packager event ready");
    });

    pc.on('stdout', (data) => {
      console.log("stdout:", data);
    });

    pc.on('stderr', (data) => {
      console.error("stderr:", data);
    });

    pc.on('ngrokReady', (ng) => {
      console.log("NGROK READY");
      try {
        let url = await pc.getUrlAsync();
        console.log("URL=" + url);
      } catch (e) {
        console.error("Problem getting URL" + e);
      }
    });

    await pc.startAsync();

    return pc;

  }
};
