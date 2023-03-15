const path = require('path')
const fs = require('fs')
const mockApi = require('..');

const app = mockApi({
  app: require('express')(),
  apiRootDir: path.resolve(__dirname, 'api'),
  apiPrefix: '/api',
})

app.listen(8080, () =>
  console.log('Api stubs running at: http://localhost:8080/api')
)
