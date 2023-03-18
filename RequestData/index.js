const express = require('express');
const evchart = require('js-text-chart').evchart;
const multer = require('multer');
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

class Item {
    constructor(name, value) {
      this.name = name;
      this.value = value;
    }
}

app.use(express.json({type: 'application/json'}));
app.post('/request/data/:kind', function (req, res) {
    let result = [];
    if (req.params.kind == 'PathVarible') {
        result.push(new Item("lesson","路径变量"));
        result.push(new Item("info","在express中叫做params，路径上每个被双单斜杠'/'隔开的一个个词语就是路径参数，当你需要在同一个接口内动态响应不同的情景时，可以让某一处或多出的路径参数前面加上一个冒号，长得比较像vue中的动态绑定，动态路径在REST风格上被广泛运行，比如操作某个用户: 'user/:id => 'user/1"))
    } else if (req.params.kind == 'RequestParam') {
        result.push(new Item("lesson","请求参数"));
        result.push(new Item("info","在express中叫做query，和路径变量相比，前者更像是前端主动携带参数去访问特定的资源，而后者更像是后端要求必须携带的数据，前端被迫携带，反应在路径上形式一般是: '/stu?class=2&sid=1&name='evanp',在基本路径之后添上一个问号，然后在后面加上请求的参数，不同参数之间用'&'符号隔开"))
    } else if (req.params.kind == 'body') {
        result.push(new Item("lesson","请求体"));
        result.push(new Item("info","路径变量和请求参数的数据都是透明的，这非常不注重隐私，因此更多时候前端应该将携带的数据放在请求体内进行传输。请求体的形式有很多，最常用的是表单和JSON，请在路径后新增一个路径变量，form, form-data或json导向不同的接口进行查看"));
    } else {
        result.push(new Item("error","这个参数不认识"));
    }
    res.send(result);
});

app.use(express.json({type: 'application/json'}));
app.use(express.urlencoded({extended: true}));
const uploads = multer();
app.post('/request/data/body/:kind', uploads.any(), function (req, res) {
    let result = [];
    if (req.params.kind == 'json') {
        result.push(new Item("lesson","json请求体"));
        result.push(new Item("body",req.body));
        result.push(new Item("info","express想解析json形式的body，必须先开启express.json: 'app.use(express.json)'，之后就可以用req.body来接收请求体了"));
        result.push(new Item("trick","进阶技巧，读取请求体时可以用match模式匹配成自己想要的格式或命名，常用于实体注入及转化等"));
    } else if (req.params.kind == 'form-urlencode') {
        result.push(new Item("lesson","form-urlencode请求体"));
        result.push(new Item("body",req.body));
    } else if (req.params.kind == 'multi-form-data') {
        console.log(req.files);
        result.push(new Item("lesson","multi-form-data请求体"));
        result.push(new Item("body",req.body));
    } else {
        result.push(new Item("error","这个参数不认识"));
    }
    res.send(result);
});

function checkQuery(req,res) {
    if (req.query.id == undefined ||
        req.query.id == null ||
        req.query.name == undefined ||
        req.query.name == null){
        res.send({"msg": "query不齐全"});
    }
}

app.post('/request/data/query/info',checkQuery, (req, res)=> {
    res.send(req.query);
});

//app.put

//app.delete

const server = app.listen(8080, () => {
    let host = server.address().address;
    let port = server.address().port;

    let str = "EXPRESS-DEMO";
    let mode = [ "close", "far", undefined ];
    let chart = evchart.convert(str, mode[0]);
    console.log(chart);

    console.log("Server is ready on http://%s:%s", host, port);
})