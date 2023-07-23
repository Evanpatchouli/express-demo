const routes = require('express').Router();
const Resp = require('./Resp');
const CONFIG = require('./config');
const yaml = require('js-yaml');

routes.get('/app', (req, res, next)=>{
    res.send(Resp.Ok("app中的'全局'变量", {"appname":req.app.get("appname")}));
});

routes.get('/global', (req, res, next)=>{
    res.send(Resp.Ok("global中的全局变量", {"appname":__config.appname}));    //global的好处是，可以不加global，且不用任何引入，使用起来贼方便，注意命名搞特殊点，防止变量污染
});

routes.get('/module', (req, res, next)=>{
    res.send(Resp.Ok("config模块当作全局变量", {"appname":CONFIG.appname}));
});

routes.get('/json', (req, res, next)=>{
    let configJson = require('./config.json');
    res.send(Resp.Ok("json静态配置文件", {"appname":configJson.appname}));
});

routes.get('/json5', (req, res, next)=>{
    let configJson5 = require('./config.json5');
    res.send(Resp.Ok("json5静态配置文件", {"appname":configJson5.appname}));
});

routes.get('/yaml', (req, res, next)=>{
    /*Object */
    let configYaml = yaml.load(fs.readFileSync('./config.yaml'));
    res.send(Resp.Ok("yaml动态配置文件", {"appname":configYaml.appname}));
});

module.exports = routes;