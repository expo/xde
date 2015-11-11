var download = require('./')

download({
  version: '0.26.1',
  platform: 'darwin',
  symbols: 'true'
}, function (err, zipPath) {
  if (err) throw err
  console.log('OK! zip:', zipPath)
  process.exit(0)
})
