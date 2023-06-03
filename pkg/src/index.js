const express = require('express');
const evchart = require('js-text-chart').evchart;
const app = express();
const path = require('path');
const yaml = require('js-yaml');
const fs = require('fs');
// const axios = require('axios'); pkg打包失败
// const axios = require('axios/dist/node/axios.cjs').default; axios的package.json有问题，导不出来
const axios = require("./axios.cjs").default; // 方案1
// const axioscjs = path.join(__dirname,"../node_modules/axios/dist/node/axios.cjs");
// const axios = require(axioscjs).default;  // 方案2

class Config {
    app = {
        /**
         * @type {string}
         */
        name,
        /**
         * @type {string}
         */
        version
    };
    server = {
        /**
         * @type {string}
         */
        host,
        /**
         * @type {string|number}
         */
        port
    }
}
// const config = yaml.load(fs.readFileSync(`${__dirname}/../assets/config.yaml`));
/**
 * @type {Config}
 */
const config = yaml.load(
    fs.readFileSync(
        path.join(
            __dirname,
            '../assets/config.yaml')
        ));
// const dbpath = `${process.cwd()}/db/data.db`;
const dbpath = path.join(process.cwd(), './db/data.db');
const knex = require('knex');
const sqlite = knex({
    client: 'sqlite3',
    connection: {
      filename: dbpath,
      acquireConnectionTimeout: 1000
    },
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
    axios.get(`http://${config.server.host}:${config.server.port}/config`)
    .then(function (resp) {
        res.json(resp.data);
    })
});

const server = app.listen(config.server.port, config.server.host, () => {
    let host = server.address().address;
    let port = server.address().port;

    let str = config.app.name;
    let mode = [ "close", "far", undefined ];
    let chart = evchart.convert(str, mode[0]);
    console.log(chart);

    console.log("Server is ready on http://%s:%s", host, port);
})