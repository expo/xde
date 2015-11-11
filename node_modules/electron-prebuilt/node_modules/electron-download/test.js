var download = require('./')

download({
  version: '0.25.1',
  arch: 'ia32',
  platform: 'win32'
}, function (err, zipPath) {
  if (err) throw err
  console.log('OK! zip:', zipPath)
  process.exit(0)
})
