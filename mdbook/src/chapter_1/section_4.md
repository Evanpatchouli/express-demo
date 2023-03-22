# 响应

上一节讲完了请求，这一节我们就来讲一下响应吧！  
本节作为初级内容，将罗列比较常用的响应方法以及其简单的使用形态

## 准备工作

拷贝第一节Hello World项目

## status

**res.statue(status code)**，这是很实用的一个方法，设置响应体的Http状态码，虽然REST-Apid的风格的是统一200，但在express.js中，有些情景下你必须设置status code为某个值

```javascript
res.status(404);
```

## send

**res.send(content)**，将任意类型的内容放在响应体内返回给请求源

```javascript
app.get('/', function (req, res) {
    res.send('Hello World!');
});
```

也可以接在status后面:
```javascript
res.status(200).send(<p>hello world</p>);
```

## end

**res.end()**，用于快速结束不需要返回数据的场景下的响应，不过end()也可以传送数据，但性能消耗较大，不建议用res.end传数据和信息

```javascript
//END
app.get('/end',(req,res)=>{
    res.status(404).end();
})
```

## json

**res.json(content)**，以json格式的请求体返回给请求源，可能会收到跨域保护的限制，因此往往需要我们顶上设置的一串Allow

```javascript
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
```

## jsonp

**res.jsonp(content)**，jsonp是开发者们自研的一种不正统的数据格式，和json基本一样，但不太会被跨域保护给拦着

```javascript
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
```

## sendFile

**res.sendFile(path,options)**，静态传输文件，不能直接使用相对路径

```js
//sendfile，传输文件
app.get('/sendfile',(req,res)=>{
    //只能是静态路径，需要相对路径的话有很多方法，以下是其中一个
    res.sendFile("hello.txt", {root: __dirname});
})
```

## download

**res.download(path)**，下载传输文件，这个可以直接使用相对路径

```js
//download，下载文件
app.get('/download',(req,res)=>{
    //可以直接相对路径
    res.download("./hello.txt");
})
```

## sendStatus


**res.sendStatus(status code)**，设置响应码，并返回信息为该状态码预设好的文本，比如res.sendStatus(404)，则响应的状态码是s404，返回的信息是'not Found'
```js
//sendstatus
app.get('/sendstatus',(req,res)=>{
    //预先写好的httpStatus组合，改一下试试，如果你输入的status码不存在，msg将变成这个码的数字
    res.sendStatus(404);
})
```

## location

**res.location(route)**，REST接口之间的转发，必须设置status为300~309之间的数字，才能成功转发

```js
//location
app.get('/location/1',(req,res)=>{
    //转发到最早的helloworld路由去
    res.location('/').status(302).send();
})

//location/2
app.get('/location/2',(req,res)=>{
    //转达到下面定义的这个接口
    res.location('/location/index').status(302).send();
})

app.get('/location/index',(req,res)=>{
    res.send("welcome to learn express.js by demos");
})
```

## redirect

**res.redirect()**，路由重定向，这个比较特殊，我们放到路由控制那一节再讲

## 下一章-Sql-knex增删改查