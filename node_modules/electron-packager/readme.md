# electron-packager

Package your [Electron](http://electron.atom.io) app into OS-specific bundles (`.app`, `.exe`, etc.) via JavaScript or the command line. Supports building Windows, Linux or Mac executables.

[![Build Status](https://travis-ci.org/maxogden/electron-packager.svg?branch=master)](https://travis-ci.org/maxogden/electron-packager)

## About

Electron Packager is a command line tool that packages electron app source code into executables like `.app` or `.exe` along with a copy of Electron.

This module was developed as part of [Dat](http://dat-data.com/), a grant funded non-profit open source project. It is maintained by volunteers. If you are benefitting from this module please consider making contributions back.

Note that packaged Electron applications can be relatively large. A zipped barebones OS X Electron application is around 40MB.

## Installation

```sh
# for use in npm scripts
npm install electron-packager --save-dev

# for use from cli
npm install electron-packager -g
```

## Usage

### From the Command Line

Running electron-packager from the command line has this basic form:

```
electron-packager <sourcedir> <appname> --platform=<platform> --arch=<arch> --version=<Electron version> [optional flags...]
```

This will:

- Find or download the correct release of Electron
- Use that version of Electron to create a app in `<out>/<appname>-<platform>-<arch>` *(this can be customized via an optional flag)*

For details on the optional flags, run `electron-packager --help` or see [usage.txt](https://github.com/maxogden/electron-packager/blob/master/usage.txt).

You should be able to launch the app on the platform you built for. If not, check your settings and try again.

**Be careful** not to include `node_modules` you don't want into your final app. `electron-packager`, `electron-prebuilt` and `.git` will be ignored by default. You can use `--ignore` to ignore files and folders via a regular expression. For example, `--ignore=node_modules/electron-packager` or `--ignore="node_modules/(electron-packager|electron-prebuilt)"`.

#### Example

Given the app `FooBar` with the following file structure:

```
foobar
├─package.json
└┬src
 ├─index.html
 ├─script.js
 └─style.css
```

When one runs the following command for the first time in the `foobar` directory:

```
electron-packager . FooBar --platform=darwin --arch=x64 --version=0.28.2
```

`electron-packager` will do the following:

* downloads Electron 0.28.2 for OS X on x64 (and caches the download in `~/.electron`)
* builds the OS X `FooBar.app`
* places `FooBar.app` in `foobar/FooBar-darwin-x64/` (since an `out` directory was not specified)

The file structure now looks like:

```
foobar
├┬FooBar-darwin-x64
│├┬FooBar.app
││└[…Mac app contents…]
│├─LICENSE
│└─version
├─package.json
└┬src
 ├─index.html
 ├─script.js
 └─style.css
```

The `FooBar.app` folder generated can be executed by a system running OS X, which will start the packaged Electron app.

### Programmatic API
```javascript
var packager = require('electron-packager')
packager(opts, function done (err, appPath) { })
```
#### packager(opts, callback)

##### opts

**Required**

`dir` - *String*

  The source directory.

`name` - *String*

  The application name.

`platform` - *String*

  Allowed values: *linux, win32, darwin, all*

  Not required if `all` is used.
  Arbitrary combinations of individual platforms are also supported via a comma-delimited string or array of strings.
  The non-`all` values correspond to the platform names used by [Electron releases](https://github.com/atom/electron/releases).

`arch` - *String*

  Allowed values: *ia32, x64, all*

  Not required if `all` is used.
  The non-`all` values correspond to the architecture names used by [Electron releases](https://github.com/atom/electron/releases).

`version` - *String*

  Electron version (without the 'v') - for example, [`0.33.9`](https://github.com/atom/electron/releases/tag/v0.33.9). See [Electron releases](https://github.com/atom/electron/releases) for valid versions.

**Optional**

`all` - *Boolean*

  When `true`, sets both `arch` and `platform` to `all`.

`app-bundle-id` - *String*

`app-version` - *String*

`asar` - *Boolean*

`asar-unpack` - *String*

`build-version` - *String*

`cache` - *String*

`helper-bundle-id` - *String*

`icon` - *String*

  Currently you must look for conversion tools in order to supply an icon in the format required by the platform:

  - OS X: `.icns`
  - Windows: `.ico` ([See below](#building-windows-apps-from-non-windows-platforms) for details on on-Windows platforms)
  - Linux: this option is not required, as the dock/window list icon is set via [the icon option in the BrowserWindow contructor](http://electron.atom.io/docs/v0.30.0/api/browser-window/#new-browserwindow-options). Setting the icon in the file manager is not currently supported.

If the file extension is omitted, it is auto-completed to the correct extension based on the platform, including when `--platform=all` is in effect.

`ignore` - *RegExp*

`out` - *String*

`overwrite` - *Boolean*

`prune` - *Boolean*

`sign` - *String*

`version-string` - *Object*

  Object hash of application metadata to embed into the executable (Windows only):
  - `CompanyName`
  - `LegalCopyright`
  - `FileDescription`
  - `OriginalFilename`
  - `FileVersion`
  - `ProductVersion`
  - `ProductName`
  - `InternalName`

##### callback

`err` - *Error*

  Contains errors, if any.

`appPath` - *String*

  Path to the newly created application.

## Building Windows apps from non-Windows platforms

Building an Electron app for the Windows platform with a custom icon requires editing the `Electron.exe` file. Currently, electron-packager uses [node-rcedit](https://github.com/atom/node-rcedit) to accomplish this. A Windows executable is bundled in that node package and needs to be run in order for this functionality to work, so on non-Windows platforms, [Wine](https://www.winehq.org/) needs to be installed. On OS X, it is installable via [Homebrew](http://brew.sh/).

## Related

- [electron-builder](https://www.npmjs.com/package/electron-builder) - for creating installer wizards
- [grunt-electron](https://github.com/sindresorhus/grunt-electron) - grunt plugin for electron-packager
- [electron-packager-interactive](https://github.com/Urucas/electron-packager-interactive) - an interactive CLI for electron-packager
