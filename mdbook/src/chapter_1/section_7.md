# 路由控制

## 准备工作

拷贝第一节HelloWorld项目
## 动态路由

这个最初我们就接触到了，路径中某一段前面加冒号
```js
//路径变量-动态路由
app.get('/:var',(req, res)=>{
    res.send(req.params.var);
});
```

## 路由匹配

利用通配符 * 匹配符合的所有路由

- 全通配

**定义时**，以 * 结尾，或者 * 之后除了斜杠没有其他字符，匹配*之后所有的路由
```js
//全部匹配，囊括了match之下的所有路由，即便前端请求路径时在后面再来几段，也会被当作一个字符串 /x/1/6 -> '/x/1/6'
//慎用，必须确保其他独立的路由不会被覆盖了
app.get('/matchall/*',(req, res)=>{
    let what = {
        params: req.params,
        theVar: req.params['0']
    }
    res.send(what);
});
```
前端发来请求时，如何有2个定义的接口都能匹配到，优先匹配先定义的
```js
//不起效
app.get('/matchall/w/xf',(req, res)=>{
    res.send("there is w.xf");
});
```

- 局部通配

在两个字符之间(斜杠不算，除非你转义过了)使用 *，匹配这两个字符中间夹任何一段字符串的路由:  
xAy,xBy,xvenapy...
```js
//xy中间随便夹
app.get('/match/x*y', function (req, res) {
    res.send('xy肉夹馍')
})
```
```js
//除非通配符后面有除了斜杠以外的字符，不然全部被盖
app.get('/match/w*/x', function (req, res) {
    res.send('除非通配符后面有除了斜杠以外的字符，不然全部被盖')
})
```

- 动态字符(串)

问号前的字符可有可无，gback,goback

```js
//问号前面这个字符可有可无
app.get('/match/go?back',(req, res)=>{
    res.send("问号前面这个字符可有可无");
});
```

问号前被括号括住的字符串可有可无，xback,xgoback
```js
app.get('/match/x(go)?back',(req, res)=>{
    res.send("问号前面这个字符串可有可无，注意被括住的字符串前面不能没有字符");
});
```

加号前的字符可以重复，goback,gooback,goooback...
```js
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
```

## 正则匹配

可用于复杂路由的匹配，在路由中局部正则时，记得用括号包住
```js
//正则匹配
//匹配了127.0.0.1:8080/x//数字useremm//
app.get('/x/(\/[0-9]useremm\/)', function (req,res) {
    console.log(req.body);
    res.send("正则可用于复杂路径的匹配");
})
```

## 路由重定向

有时候我们希望某些情况下将路径转发到其他路径，比如404页面之类的  
格式: `res.redirect(status, url)`  
status是干什么的？对于重定向后的路由不同的请求方法应该使用不同的status:

- GET
```js
//转发到 GET /1/2/3/4/5
app.post('/redirect',(req,res)=>{
    res.redirect(301,'/1/2/3/4/5');
});

app.get('/1/2/3/4/5',(req,res)=>{
    res.send("上山打老虎");
})
```

301或302都是可以的，301代表临时，302代表永久

接下来我们把转发后的路由改成POST，再去访问redirect:
```js
app.post('/1/2/3/4/5',(req,res)=>{
    res.send("上山打老虎");
})
```
是的，响应不到了，转发到POST路由，应当使用307或308，前者临时后者永久  
`res.redirect(301,'/1/2/3/4/5');`

- JSON与重定向

开启`app.use(express.json)`，再尝试访问redirect，结果又得不到响应了，这是为什么？  
开启了json解析后，请求变成了json，请求已经不是原始的请求了，变成了json对象，是没办法被转发的  
因此在有需要重定向的时候，我们不应该全局json解析了，而是在需要json解析的路由上开启json解析:

建个需要使用json解析的测试接口:
```js
app.put('/some/json',(req,res)=>{
    res.send(req.body);
});
```

自定义一个选择性body-json的中间件，判定 PUT:/some/json 时局部开启json解析:
```js
app.use((req, res, next) => {
    // 判断当前请求路径是否需要解析JSON请求体
    if (req.path === '/some/json'&& req.method.match("PUT")) {
      bodyParser.json()(req, res, next);
    } else {
      next();
    }
});
```

尝试用api调试工具访问redirect，重定向成功了，再访问/some/json，也能成功打印请求体.

## 下一节-JWT基础鉴权