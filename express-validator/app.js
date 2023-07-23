const express = require('express');
const AsyncErrPlugn = require('express-async-errors');
const index = require('./router/index.js');
const logger = require('./utils/logger.js');

const app = express();

app.use('/', index);

app.use((err, req, res, next) => {
  logger.error(err.message);
  const {name,message} = err;
  res.status(500).json({name,message});
})

module.exports = app;
