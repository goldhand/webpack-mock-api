
const fs = require('fs')
const path = require('path')
const express = require('express')
const cors = require('cors')

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


// Allow cross-origin
const corsOpen = () =>
  cors({
    origin: (origin, callback) => {
      callback(null, [origin])
    },
    credentials: true,
  })

const getResponseData = (fp, req) => {
  if (fp.endsWith('.js')) {
    const dataAsModule = require(fp)
    if (typeof dataAsModule === 'function') {
      return dataAsModule(req)
    } else {
      return dataAsModule
    }
  } else {
    return JSON.parse(fs.readFileSync(fp))
  }
}

const expressMockApi = ({
  app,
  apiRootDir,
  apiPrefix = '',
  transform = (fp) => fp.split('.')[0],
}) => {
  const apiMap = apiStubMap(apiRootDir, apiPrefix, transform)
  // Enable POST body handling
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  Object.entries(apiMap).forEach(([np, fp]) => {
    app.get(np, corsOpen(), async (req, res) => {
      res.json(getResponseData(fp, req))
    })
    app.post(np, corsOpen(), async (req, res) => {
      res.json(getResponseData(fp, req))
    })
    app.options(np, corsOpen())
  })
  app.get(`${apiPrefix}*`, (req, res) => {
    res.send(`
<html>
<body>
<h1>Mock API paths:</h1>
<ul>
  ${Object.keys(apiMap)
    .map((np) => `<li><a href="${np}">${np}</a></li>`)
    .join('')}
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
