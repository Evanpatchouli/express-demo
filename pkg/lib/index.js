"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var express = require('express');
var evchart = require('js-text-chart').evchart;
var app = express();
var path = require('path');
var yaml = require('js-yaml');
var fs = require('fs');
// const axios = require('axios');
var axioscjs = path.join(__dirname, "../node_modules/axios/dist/node/axios.cjs");
var axios = require(axioscjs)["default"];
// const config = yaml.load(fs.readFileSync(`${__dirname}/../assets/config.yaml`));
var Config = /*#__PURE__*/_createClass(function Config() {
  _classCallCheck(this, Config);
  _defineProperty(this, "app", {
    /**
     * @type {string}
     */
    name: name,
    /**
     * @type {string}
     */
    version: version
  });
  _defineProperty(this, "server", {
    /**
     * @type {string}
     */
    host: host,
    /**
     * @type {string|number}
     */
    port: port
  });
});
/**
 * @type {Config}
 */
var config = yaml.load(fs.readFileSync(path.join(__dirname, '../assets/config.yaml')));
// const dbpath = `${process.cwd()}/db/data.db`;
var dbpath = path.join(process.cwd(), './db/data.db');
var knex = require('knex');
var sqlite = knex({
  client: 'sqlite3',
  connection: {
    filename: dbpath,
    acquireConnectionTimeout: 1000
  }
});
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
app.get('/config', function (req, res) {
  res.json(config);
});
app.get('/db', function (req, res) {
  res.download(dbpath);
});
app.get('/toConfig', function (req, res) {
  axios.get("http://".concat(config.server.host, ":").concat(config.server.port, "/config")).then(function (resp) {
    res.json(resp.data);
  });
});
var server = app.listen(config.server.port, config.server.host, function () {
  var host = server.address().address;
  var port = server.address().port;
  var str = config.app.name;
  var mode = ["close", "far", undefined];
  var chart = evchart.convert(str, mode[0]);
  console.log(chart);
  console.log("Server is ready on http://%s:%s", host, port);
});