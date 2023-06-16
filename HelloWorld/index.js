const express = require('express');
const evchart = require('js-text-chart').evchart;
const app = express();

app.all("*", function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Methods", "*");
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.get('/get', function (req, res) {
    let requestParams = req.query;
    res.send(requestParams);
});

const server = app.listen(8090, () => {
    let host = server.address().address;
    let port = server.address().port;

    let str = "EXPRESS-DEMO";
    let mode = [ "close", "far", undefined ];
    let chart = evchart.convert(str, mode[0]);
    console.log(chart);

    console.log("Server is ready on http://%s:%s", host, port);
})