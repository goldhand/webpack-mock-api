const mockApi = require('../webpack-mock-api');
const path = require('path');

(() => {
  console.log('getStubPaths')
  const result = mockApi.getStubPaths(path.resolve(__dirname, 'api'))
  console.log(result)
})();

(() => {
  console.log('deepFlatMap')
  const input = [
    '/Users/wfarley/playground/webpack-mock-api/tests/api/baz.json',
    [
      '/Users/wfarley/playground/webpack-mock-api/tests/api/foo/bar.json',
      [
        '/Users/wfarley/playground/webpack-mock-api/tests/api/foo/beep/boop.json'
      ],
      [
        '/Users/wfarley/playground/webpack-mock-api/tests/api/foo/ding/dong.json'
      ]
    ]
  ]
  const result = mockApi.deepFlatMap(input)
  console.log(result)
})();


(() => {
  console.log('apiStubFilePaths')
  const result = mockApi.apiStubFilePaths(path.resolve(__dirname, 'api'))
  console.log(result)
})();

(() => {
  console.log('apiNetworkPaths')
  const result = mockApi.apiNetworkPaths(path.resolve(__dirname, 'api'), '/api', fp => fp.split('.')[0])
  console.log(result)
})();

(() => {
  console.log('apiStubMap')
  const result = mockApi.apiStubMap(path.resolve(__dirname, 'api'), '/api', fp => fp.split('.')[0])
  console.log(result)
})();

(() => {
  console.log('express')
  const apiMap = mockApi.apiStubMap(path.resolve(__dirname, 'api'), '/api', fp => fp.split('.')[0])
  Object.entries(apiMap).forEach(([np, fp]) => {
    console.log(`
app.get('${np}', (req, res) => {
  const data = fs.readFileSync('${fp}')
  res.json(data)
})
    `)
  })
})();
