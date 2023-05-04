const routes = require('express').Router();
const Resp = require('./Resp');
const CONFIG = require('./config');

routes.get('/app', (req, res, next)=>{
    res.send(Resp.Ok("app中的'全局'变量", {"appname":req.app.get("appname")}));
});

routes.get('/global', (req, res, next)=>{
    res.send(Resp.Ok("global中的全局变量", {"appname":__config.appname}));    //global的好处是，可以不加global，且不用任何引入，使用起来贼方便，注意命名搞特殊点，防止变量污染
});

routes.get('/module', (req, res, next)=>{
    res.send(Resp.Ok("config模块当作全局变量", {"appname":CONFIG.appname}));
});

module.exports = routes;