To package up for distribution:

1. Make sure you are using iojs-v2.3.1

```
    nvm use iojs-v2.3.1

    rm -rf node_modules/
    
    npm install
```

The reason for this is that the Chokidar stuff breaks on some later
versions of node/iojs, and some native modules fail to build or are weird.

Other versions like 2.5.0 might be OK, but let's stick with 2.3.1 until
we have time to thoroughly test some other stuff.

2. Make sure you have the DeveloperIDApplication.p12 certificate installed

It's in Charlie's Dropbox if you need it.

3. Make sure you are on the right branch

Whatever that is

4. Run `npm run-script package`

This will run electron-packager and create a .app and then also zip that up
and create a .zip of the .app

These will appear in the folder "Exponent XDE-darwin-x64"

5. Test the .app to make sure it works

This is dumb but you have to move it out of the directory its put in and into
a place like /tmp because otherwise it searches for node_modules/ in xde/
and gets confused and breaks

5. Go to the AWS website and upload the file to S3.

6. Update the appropriate links on the website if necessary

7. If you made changes to one branch, port those changes to other branches as necessary

