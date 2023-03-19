const bodyParser = require('body-parser');
const express = require('express');
const evchart = require('js-text-chart').evchart;
const app = express();

app.use((req, res, next) => {
    // 判断当前请求路径是否需要解析JSON请求体
    if (req.path === '/some/json'&& req.method.match("PUT")) {
      bodyParser.json()(req, res, next);
    } else {
      next();
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

//路径变量-动态路由
app.get('/:var',(req, res)=>{
    res.send(req.params.var);
});

//全部匹配，囊括了match之下的所有路由，即便后面在来几个斜杠，也会被当作一个字符串 /x/1/6 -> '/x/1/6'
//慎用，必须确保其他独立的路由不会被覆盖了
app.get('/matchall/*',(req, res)=>{
    let what = {
        params: req.params,
        theVar: req.params['0']
    }
    res.send(what);
});

//不起效
app.get('/matchall/w/xf',(req, res)=>{
    res.send("there is w.xf");
});

//问号前面这个字符可有可无
app.get('/match/go?back',(req, res)=>{
    res.send("问号前面这个字符可有可无");
});

app.get('/match/x(go)?back',(req, res)=>{
    res.send("问号前面这个字符串可有可无，注意被括住的字符串前面不能没有字符");
});

//可匹配到多个路由时，优先匹配先定义的路由
//一个或多个问号前字符
app.get('/match/go+back',(req, res)=>{
    let what = {
        match: '/match/go+back',
        url: req.url,
        tip: "加号前面的那个字符可以无限重复"
    }
    res.send(what);
});

//xy中间随便夹
app.get('/match/x*y', function (req, res) {
    res.send('xy肉夹馍')
})

//除非通配符后面有除了斜杠以外的字符，不然全部被盖
app.get('/match/w*/x', function (req, res) {
    res.send('除非通配符后面有除了斜杠以外的字符，不然全部被盖')
})

//正则匹配
//匹配了127.0.0.1:8080/x//useremm//，逆天玩意...
app.get('/x/(\/useremm\/)', function (req,res) {
    console.log(req.body);
    res.send("正则可用于复杂路径的匹配");
})

//转发到/1/2/3/4/5
// app.use(bodyParser.json);这是全局的，开启之后会导致无法重定向，因此在需要json的地方开启
//如果重定向后的路由是post，则应使用307,308，GET则使用301，302
app.post('/redirect',(req,res)=>{
    res.redirect(307,'/1/2/3/4/5');
});

app.post('/1/2/3/4/5',(req,res)=>{
    res.send("上山打老虎");
})

app.put('/some/json',(req,res)=>{
    res.send(req.body);
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