const app = require('express')();
const Resp = require('./Resp');
//当子应用没有设置时，会继承父应用中设置的字段
// app.set('appname', "subapp");
app.all('/', (req, res, next) => {
    res.send(Resp.Ok("子应用获取父应用中的全局变量", {
        appname: req.app.get("appname")
    }));
})

module.exports = app;