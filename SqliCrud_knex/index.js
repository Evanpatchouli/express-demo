const express = require('express');
const evchart = require('js-text-chart').evchart;
const app = express();
const knex = require('knex');
const sqlite = knex({
    client: 'sqlite3',
    connection: {
      filename: './data.db',
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

app.put('/db/:tbname', async function (req, res) {
    try {
        // Create a table
        await sqlite.schema
          .createTable(req.params.tbname, table => {
            table.increments('id');
            table.string('uname');
            table.string('passwd');
          })
        // Finally, add a catch statement
      } catch(e) {
        console.error(e);
    };
    res.json(null);
});

app.delete('/db/:tbname', async function (req, res) {
    try {
        // Delete a table
        await sqlite.schema.dropTable(req.params.tbname);
        // Finally, add a catch statement
      } catch(e) {
        console.error(e);
    };
    res.json(null);
});

app.use(express.json({type: 'application/json'}));
app.put('/db/:tbname/record', async function (req, res) {
    /*前端请求体格式:
    {
        "uname": "evanp",
        "passwd": "iloveu"
    }
    */
   let resultSet = null;
    try {
        // Insert a record
        resultSet = await sqlite(req.params.tbname).insert(req.body);
        // Finally, add a catch statement
      } catch(e) {
        console.error(e);
        resultSet = e;
    };
    res.json(resultSet);
});

app.get('/db/:tbname/record', async function (req, res) {
    //前端携带query: uname=evanp
   let resultSet = null;
    try {
        // select a record where uname=xxx
        resultSet = await sqlite(req.params.tbname).select('*').where('uname',req.query.uname);
        // Finally, add a catch statement
      } catch(e) {
        console.error(e);
        resultSet = e;
    };
    res.json(resultSet);
});

app.post('/db/:tbname/record', async function (req, res) {
    //前端携带query: uname=evanp
    /*前端请求体格式:
    {
        "passwd": "123456"
    }
    */
   let resultSet = null;
    try {
        // select a record where uname=xxx
        resultSet = await sqlite(req.params.tbname).update(req.body).where('uname',req.query.uname);
        // Finally, add a catch statement
      } catch(e) {
        console.error(e);
        resultSet = e;
    };
    res.json(resultSet);
});

app.delete('/db/:tbname/record', async function (req, res) {
    /*前端请求体格式:
    {
        "uname": "evanp",
        "passwd": "123456"
    }
    */
   let resultSet = null;
    try {
        // select a record where uname=xxx
        resultSet = await sqlite(req.params.tbname).del().where(req.body);
        // Finally, add a catch statement
      } catch(e) {
        console.error(e);
        resultSet = e;
    };
    res.json(resultSet);
});

const server = app.listen(8080, () => {
    let host = server.address().address;
    let port = server.address().port;

    let str = "EXPRESS-DEMO";
    let mode = [ "close", "far", undefined ];
    let chart = evchart.convert(str, mode[0]);
    console.log(chart);

    console.log("Server is ready on http://%s:%s", host, port);
})