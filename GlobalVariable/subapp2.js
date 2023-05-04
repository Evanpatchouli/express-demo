const app = require('express')();
const Resp = require('./Resp');

app.all('/', (req, res, next) => {
    // console.log(app.settings.env);
    res.send(Resp.Ok("在process.env上挂载全局变量", {
        appname: process.env.appname
    }));
})

module.exports = app;