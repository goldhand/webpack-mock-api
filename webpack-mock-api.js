
const fs = require('fs')
const path = require('path')

const getStubPaths = (filePath) => {
  if (fs.statSync(filePath).isDirectory()) {
    return fs.readdirSync(filePath).map(fp => {
      return getStubPaths(path.resolve(filePath, fp))
    })
  } else {
    return filePath;
  }
}

const deepFlatMap = (arr) => arr.flatMap(item => {
  if (Array.isArray(item)) {
    return deepFlatMap(item)
  } else {
    return item
  }
})

const apiStubFilePaths = (apiRootDir) => {
  const stubPaths = getStubPaths(apiRootDir)
  return deepFlatMap(stubPaths)
}

const apiNetworkPath = (apiRootDir, prefix = '', transform = (fp) => fp) =>
  (stubPath) => transform(`${prefix}${stubPath.substr(apiRootDir.length)}`)

const apiNetworkPaths = (apiRootDir, prefix = '', transform = (fp) => fp) => {
  const stubFilePaths = apiStubFilePaths(apiRootDir)
  return stubFilePaths.map(apiNetworkPath(apiRootDir, prefix))
}

const apiStubMap = (apiRootDir, prefix = '', transform = (fp) => fp) => {
  const networkPath = apiNetworkPath(apiRootDir, prefix, transform)
  const stubFilePaths = apiStubFilePaths(apiRootDir)
  return stubFilePaths.reduce((stubMap, fp) => {
    stubMap[networkPath(fp)] = fp
    return stubMap
  }, {})
}

const expressMockApi = ({
  app,
  apiRootDir,
  apiPrefix = '',
  transform = fp => fp.split('.')[0],
}) => {
  const apiMap = apiStubMap(apiRootDir, apiPrefix, transform)
  Object.entries(apiMap).forEach(([np, fp]) => {
    app.get(np, async (req, res) => {
      const data = fs.readFileSync(fp)
      res.json(JSON.parse(data))
    })
  })
  app.get(`${apiPrefix}*`, (req, res) => {
    res.send(`
<html>
<body>
<h1>Mock API paths:</h1>
<ul>
  ${Object.keys(apiMap).map(np => `<li><a href="${np}">${np}</a></li>`).join('')}
</body>
</html>
    `)
  })
  return app
}

module.exports = {
  getStubPaths,
  deepFlatMap,
  apiStubFilePaths,
  apiNetworkPaths,
  apiStubMap,
  expressMockApi
}
