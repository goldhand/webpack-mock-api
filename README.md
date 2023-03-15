# [webpack-mock-api]

[![npm version](https://img.shields.io/npm/v/webpack-mock-api.svg?style=flat-square)](https://www.npmjs.org/package/webpack-mock-api)

Easily mock apis with `express`, `webpack-dev-server` or `webpack-dev-middleware`.

## Setup

Create a directory with stubbed api responses with a directory structure that mirrors your api.

For example:

If my app makes an api call to `./api/users`, I would create a file at `./mocks/api/users.json` with the response data from my network call.

Then install webpack-mock-api:

```bash
npm install -D webpack-mock-api
```


## Express / webpack-dev-middleware


```js
const app = require('express')();

mockApi.expressMockApi({
  app,
  apiRootDir: path.resolve(__dirname, 'mocks', 'api'),
  apiPrefix: '/api',
});

```

This will use the directories from `./mocks/api` to create a mock api endpoint at `./api` over the network.


So a request to `./api/users` will return the file contents of `./mocks/api/users.json`.


## (Coming soon) webpack-dev-server

For now you need to use webpack-dev-middleware.


[webpack-mock-api]: https://www.npmjs.com/package/webpack-mock-api
