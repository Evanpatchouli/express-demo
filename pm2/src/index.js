async function start() {
  const config = require('./config').get();
  const init = require('./init');
  await init();
  const express = require('express');
  const jsTextChart = require('js-text-chart');
  const logger = require('./utils/logger');
  const server = require('./utils/server');

  const app = require('./app');
  
  server.on('request', app);
  server.listen(config.app.port, config.app.host, async() => {
    let host = server.address().address;
    let port = server.address().port;
  
    let str = config.app.name;
    let mode = [ "close", "far", undefined ];
    let chart = jsTextChart.convert(str, mode[0]);
    console.log(chart);
  
    console.log("Server is ready on http://%s:%s", host, port);
  });
}

start();
