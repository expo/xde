# xde [![Slack](http://slack.exponentjs.com/badge.svg)](http://slack.exponentjs.com)
The Exponent Development Environment - Beta release

xde is currently in beta but we're really happy for you to try it out!


## Quick Start Instructions

We're going to bundle it up so that you just have to download one standalone application but we haven't had a chance yet.

In the meantime, you can perform the following steps:
  * `git clone` this repository,
  * Make sure you have iojs version 2.3.1. If you don't have it, use [nvm]( https://github.com/creationix/nvm) to install it. It won't clobber other installations of node you have and you can choose just to use it for npm installing xde (which is all you need it for).

```shell
  touch ~/.profile
  curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.26.1/install.sh | bash
   [Open a new terminal window]
  nvm install iojs-v2.3.1
  nvm use iojs-v2.3.1
```

  * Go into the `xde/` directory where you cloned the Git repo and run `npm install`.
  * Once that completes, run `npm start` to start the GUI.

### Making a New Project

To make a new project, just click the "New" button in the upper left hand corner of the window. Then choose or make an empty directory where you want your project to live and hit OK.

This will setup that directory with a very basic React Native project that will work with Exponent and show off some basic but still cool things about React Native.

### Viewing a Project on Your Phone

Once you create a new project (or open an existing project), you'll see some log messages that the packager has started and ngrok has started and the URL bar will get populated.

The url that begins with `exp://...` is the URL you can use to access your project while you're developing it. To view this on your phone, do the following:

  * Go get the Exponent app on your iPhone or iPad. It's available [here](https://itunes.com/apps/exponent). We'll produce an Android version as soon as React Native for Android is ready, but for now it's only iOS!

  * Open the Exponent app and put in your e-mail address.

  * Go back to the xde GUI on your computer and put in your phone number or e-mail address into the text box in the header, then hit the "Send Link" button. This will send a link via e-mail or text message, so make sure you use an address or phone number you can access from your phone.

  * Check your e-mail or texts and tap the link. The Exponent app should open and you should be able to view your experience there!

### Converting an existing project to work with Exponent

React Native apps that don't use native modules can work with Exponent. To configure them, you typically need to do a few quick steps:

  * In the directory that contains your React Native JavaScript source code, make sure there is a `package.json` file. There may already be one, but if not, run `npm init` to create one.

  * If the entry point of your app is not `index.js` then add an entry `"main"` in your `package.json` and give the filename that is the entry point for your app. Entry point basically means the file that contains the root component of your app.

  * At the bottom of your entry point file, add a line like this:

  ```js
  AppRegistry.registerComponent('main', () => MyRootComponentName);
  ```

  where `MyRootComponentName` is the name of your app's root component. There may already be a line like

  ```js
  AppRegistry.registerComponent('MyRootComponentName', () => MyRootComponentName);
  ```

  Just leave that; it's totally fine to register the same component twice under two different names. Exponent by default looks for the `main` entry.

  Now you can open this directory in xde and send the URL to yourself and view what you've made.

### Publishing a Project

To publish something you've made, just follow these steps:

  * In xde, create an Exponent account or login to an existing one using the pane on the right of the header.

  * Once you're logged in, open the project directory for the thing you want to publish. The packager should start, etc.

  * Check to make sure you can load your app by sending the link to yourself and opening it in the Exponent app.

  * Once everything looks good, hit the "Publish" button. A few seconds later, you should get a clean URL sent to you that points to the exp.host server where your package was published to.

You can publish as many times as you want and it will replace your old version, so don't worry about making a mistake!
