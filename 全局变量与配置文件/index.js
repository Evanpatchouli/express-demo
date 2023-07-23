require('./global');
require('json5/lib/register');
const express = require('express');
const evchart = require('js-text-chart').evchart;
const app = express();
const routes = require('./router');
const subapp = require('./subapp');
const subapp2 = require('./subapp2');

app.set("appname", "GlobalVar");
process.env.appname = "GlobalVar";

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

app.use(routes);

app.use('/subapp',subapp);
app.use('/process.env',subapp2);

const server = app.listen(8080, () => {
    let host = server.address().address;
    let port = server.address().port;

    let str = "GlobalVar";
    let mode = [ "close", "far", undefined ];
    let chart = evchart.convert(str, mode[0]);
    console.log(chart);

    console.log("Server is ready on http://%s:%s", host, port);
})