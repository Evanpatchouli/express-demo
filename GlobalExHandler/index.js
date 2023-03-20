const express = require('express');
const evchart = require('js-text-chart').evchart;
const app = express();
// import 'express-async-errors'

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
    next(err);
    //throw err
    // res.send('Hello World!');
});

app.post('/', (req, res, next)=> {
    setTimeout(()=>{
        const err = new Error();
        err.name = '无法访问';
        err.message = '对不起，网站真的正在维护中！';
        next(err);
    },3000);
    res.send("Bad World!");//尝试隐藏
});

let exhandler = (err, req, res, next)=> {
    console.error('Error:', err);
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