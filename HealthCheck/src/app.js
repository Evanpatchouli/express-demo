const express = require('express');
const index = require('./router/index.js');
const {excatcher,exlogger} = require('./midwares/exhandler');
const actuator = require('express-actuator');

const app = express();

app.use(actuator({
  basePath: '/actuator',
  infoGitMode: 'simple',
  // infoBuildOptions: null, // extra information you want to expose in the build object. Requires an object.
  // infoDateFormat: null, // by default, git.commit.time will show as is defined in git.properties. If infoDateFormat is defined, moment will format git.commit.time. See https://momentjs.com/docs/#/displaying/format/.
  customEndpoints: [] // array of custom endpoints
}));

app.use('/', index);

app.use(excatcher);

app.use(exlogger);

module.exports = app;

