const express = require('express');
const index = require('./router/index.js');
const {excatcher,exlogger} = require('./midwares/exhandler');

const app = express();

app.use('/', index);

app.use(excatcher);

app.use(exlogger);

module.exports = app;

