const express = require('express');
const evchart = require('js-text-chart').evchart;

const goodApp = require('./goodModule/app');
const orderApp = require('./orderModule/app');
const userApp = require('./userModule/app');

const server = express();

server.use(goodApp,orderApp,userApp);

server.listen(8080, () => {
    let host = server.address().address;
    let port = server.address().port;

    let str = "EXPRESS-DEMO";
    let mode = [ "close", "far", undefined ];
    let chart = evchart.convert(str, mode[0]);
    console.log(chart);

    console.log("Server is ready on http://%s:%s", host, port);
})