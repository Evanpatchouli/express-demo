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

class Item {
    constructor(name, value) {
      this.name = name;
      this.value = value;
    }
}

app.use('/any', function (req, res) {
    res.send('Bad World!');
});

app.get('/request', function (req, res) {
    let result = [];
    result.push(new Item("baseUrl",req.baseUrl));
    result.push(new Item("fresh",req.fresh));
    result.push(new Item("hostname",req.hostname));
    result.push(new Item("ip",req.ip));
    result.push(new Item("originalUrl",req.originalUrl));
    result.push(new Item("params",req.path));   //路劲参数: /x/y/z/
    result.push(new Item("protocol",req.protocol));
    result.push(new Item("query",req.query));
    result.push(new Item("body",req.body));
    result.push(new Item("route",req.route));
    result.push(new Item("is:Content-Type",req.is('application/json')));

    res.send(result);
});

app.use(express.json({type: 'application/json'}));

app.post('/post', function (req, res) {
    let result = [];
    result.push(new Item("baseUrl",req.baseUrl));
    result.push(new Item("fresh",req.fresh));
    result.push(new Item("hostname",req.hostname));
    result.push(new Item("ip",req.ip));
    result.push(new Item("originalUrl",req.originalUrl));
    result.push(new Item("params",req.path));
    result.push(new Item("protocol",req.protocol));
    result.push(new Item("query",req.query));
    result.push(new Item("body",req.body));
    result.push(new Item("route",req.route));
    result.push(new Item("is:Content-Type",req.is('application/json')));

    res.send(result);
});

//app.put

//app.delete

const server = app.listen(8080, () => {
    let host = server.address().address;
    let port = server.address().port;

    let str = "EXPRESS-DEMO";
    let mode = [ "close", "far", undefined ];
    let chart = evchart.convert(str, mode[0]);
    console.log(chart);

    console.log("Server is ready on http://%s:%s", host, port);
})