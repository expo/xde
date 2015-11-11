<p align="center">
  <a href="http://gulpjs.com">
    <img height="257" width="114" src="https://raw.githubusercontent.com/gulpjs/artwork/master/gulp-2x.png">
  </a>
</p>

# gulp-cli

[![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Coveralls Status][coveralls-image]][coveralls-url] [![Gitter chat][gitter-image]][gitter-url]

Command Line Utility for Gulp

## Usage

```bash
> gulp [options] tasks
```

## Options

<table>
  <thead>
    <tr>
      <th width="25%">Flag</th>
      <th width="15%">Short Flag</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>--help</td>
      <td>-h</td>
      <td>Show this help.</td>
    </tr>
    <tr>
      <td>--version</td>
      <td>-v</td>
      <td>Print the global and local gulp versions.</td>
    </tr>
    <tr>
      <td>--require [path]</td>
      <td></td>
      <td>Will require a module before running the gulpfile. This is useful for transpilers but also has other applications.</td>
    </tr>
    <tr>
      <td>--gulpfile [path]</td>
      <td></td>
      <td>Manually set path of gulpfile. Useful if you have multiple gulpfiles. This will set the CWD to the gulpfile directory as well.</td>
    </tr>
    <tr>
      <td>--cwd [path]</td>
      <td></td>
      <td>Manually set the CWD. The search for the gulpfile, as well as the relativity of all requires will be from here.</td>
    </tr>
    <tr>
      <td>--verify</td>
      <td></td>
      <td>Will verify plugins referenced in project's package.json against the plugins blacklist.</td>
    </tr>
    <tr>
      <td>--tasks</td>
      <td>-T</td>
      <td>Print the task dependency tree for the loaded gulpfile.</td>
    </tr>
    <tr>
      <td>--tasks-simple</td>
      <td></td>
      <td>Print a plaintext list of tasks for the loaded gulpfile.</td>
    </tr>
    <tr>
      <td>--tasks-json [path]</td>
      <td></td>
      <td>Print the task dependency tree, in JSON format, for the loaded gulpfile. The [path] argument is optional, and if given writes the JSON to the path.</td>
    </tr>
    <tr>
      <td>--color</td>
      <td></td>
      <td>Will force gulp and gulp plugins to display colors, even when no color support is detected.</td>
    </tr>
    <tr>
      <td>--no-color</td>
      <td></td>
      <td>Will force gulp and gulp plugins to not display colors, even when color support is detected.</td>
    </tr>
    <tr>
      <td>--silent</td>
      <td>-S</td>
      <td>Suppress all gulp logging.</td>
    </tr>
    <tr>
      <td>--continue</td>
      <td></td>
      <td>Continue execution of tasks upon failure.</td>
    </tr>
    <tr>
      <td>--log-level</td>
      <td>-L</td>
      <td>Set the loglevel. -L for least verbose and -LLLL for most verbose. -LLL is default.</td>
    </tr>
  </tbody>
</table>

## License

MIT

[gittip-url]: https://www.gittip.com/WeAreFractal/
[gittip-image]: http://img.shields.io/gittip/WeAreFractal.svg

[downloads-image]: http://img.shields.io/npm/dm/gulp-cli.svg
[npm-url]: https://npmjs.org/package/gulp-cli
[npm-image]: http://img.shields.io/npm/v/gulp-cli.svg

[travis-url]: https://travis-ci.org/gulpjs/gulp-cli
[travis-image]: http://img.shields.io/travis/gulpjs/gulp-cli.svg

[coveralls-url]: https://coveralls.io/r/gulpjs/gulp-cli
[coveralls-image]: http://img.shields.io/coveralls/gulpjs/gulp-cli/master.svg

[gitter-url]: https://gitter.im/gulpjs/gulp
[gitter-image]: https://badges.gitter.im/gulpjs/gulp.png
