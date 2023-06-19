const express = require('express');
require('express-async-errors');
const evchart = require('js-text-chart').evchart;
const app = express();

app.all("*", function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Methods", "*");
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

app.get('/', (req, res, next)=> {
    const err = new Error();
    err.name = '无法访问';
    err.message = '对不起，网站正在维护中';
    // next(err);
    throw err;
});

app.post('/', async (req, res, next)=> {
    res.send(await error()).end();
});

function error() {
    let err = new Error('网站维护');
    err.message = "自定义的错误";
    return Promise.reject(err);
}

let exhandler = (err, req, res, next)=> {
    console.error('Error:', err.message);
    res.status(500).json(err);
}


app.use(exhandler);

const server = app.listen(8080, () => {
    let host = server.address().address;
    let port = server.address().port;

    let str = "EXPRESS-DEMO";
    let mode = [ "close", "far", undefined ];
    let chart = evchart.convert(str, mode[0]);
    console.log(chart);

    console.log("Server is ready on http://%s:%s", host, port);
})