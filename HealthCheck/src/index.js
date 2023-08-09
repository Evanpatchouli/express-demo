async function start() {
  const config = require('./config').get();
  const init = require('./init');
  await init();
  const express = require('express');
  const jsTextChart = require('js-text-chart');
  const logger = require('./utils/logger');
  const server = require('./utils/server');
  const Lightship = await import('lightship');
  const createLightship = Lightship.createLightship;
  
  const app = require('./app');
  const lightship = await createLightship({
    detectKubernetes: false,
    port: 8081,
    // gracefulShutdownTimeout, // 优雅停机时间
    // shutdownDelay, // 优雅停机延迟
    // shutdownHandlerTimeout, // 优雅停机Handler时间
    // signals, // An a array of [signal events]{@link https://nodejs.org/api/process.html#process_signal_events}. Default: [SIGTERM].
    // terminate // Default: `() => { process.exit(1) };`
  });
  
  server.on('request', app);
  server.listen(config.app.port, config.app.host, async() => {
    let host = server.address().address;
    let port = server.address().port;
  
    let str = config.app.name;
    let mode = [ "close", "far", undefined ];
    let chart = jsTextChart.convert(str, mode[0]);
    console.log(chart);
  
    console.log("Server is ready on http://%s:%s", host, port);

    lightship.registerShutdownHandler(() => {
      lightship.shutdown();
      server.close();
    })
    
    lightship.signalReady();
  });
}

start();
