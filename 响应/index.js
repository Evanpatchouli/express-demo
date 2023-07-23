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

//END
app.get('/send',(req,res)=>{
    res.status(200).end("you got send");
})

//END
app.get('/end',(req,res)=>{
    res.status(404).end();
})

//json - 同源限制
app.get('/json',(req,res)=>{
    let resp = {
        code: 200,
        msg: "json",
        toPrint: function(){
            console.log(`resp[code: ${this.code}, msg: ${this.msg}]`);
        }
    }
    res.jsonp(resp);
})

//jsonp - 更容易的解决跨域
app.get('/jsonp',(req,res)=>{
    let resp = {
        code: 200,
        msg: "jsonp",
        toPrint: function(){
            console.log(`resp[code: ${this.code}, msg: ${this.msg}]`);
        }
    }
    res.jsonp(resp);
})

//sendfile，传输文件
app.get('/sendfile',(req,res)=>{
    //只能是静态路径，需要相对路径的话有很多方法，以下是其中一个
    res.sendFile("hello.txt", {root: __dirname});
})

//download，下载文件
app.get('/download',(req,res)=>{
    //可以直接相对路径
    res.download("./hello.txt");
})

//sendstatus
app.get('/sendstatus',(req,res)=>{
    //预先写好的httpStatus组合，改一下试试，如果你输入的status码不存在，msg将变成这个码的数字
    res.sendStatus(999);
})

//location
app.get('/location/1',(req,res)=>{
    //预先写好的httpStatus组合
    res.location('/').status(404).send();
})

//location/2
app.get('/location/2',(req,res)=>{
    //预先写好的httpStatus组合
    res.location('/location/index').status(302).send();
})

app.get('/location/index',(req,res)=>{
    res.send("welcome to learn express.js by demos");
})

const server = app.listen(8080, () => {
    let host = server.address().address;
    let port = server.address().port;

    let str = "EXPRESS-DEMO";
    let mode = [ "close", "far", undefined ];
    let chart = evchart.convert(str, mode[0]);
    console.log(chart);

    console.log("Server is ready on http://%s:%s", host, port);
})