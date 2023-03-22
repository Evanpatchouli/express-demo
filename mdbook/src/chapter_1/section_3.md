# 处理请求数据

本节将具体介绍express后端处理请求源携带数据的一些方法和技巧

## 动态路径

很多时候我们需要处理一些类似但有操作差别或不同对象的业务，我们可以监听一段基本路径，将其中某一个段或者某几段路径作为变量，在接口中根据不同的路径变量执行不同的业务操作，这是一种REST风格比较鲜明的动态接口设计策略

### 实践

由于post也可以url传参，本节所有实例均采用post请求 

#### 第一个接口

这个接口以 /request/data/ 作为基路由，之后的kind变化的，在接口内部根据kind的值进行分支化处理。我指定了kind的3个值：PathVarible, RequestParam 和 body.  
所有的路径参数则可以由`req.params`（大概是个json对象）来获取，我要指定获取kind的值，就req.params.kind，而静态路径变量的值就等于它名字.

```js
//忽略了express项目的创建和基本配置
class Item {
    constructor(name, value) {
      this.name = name;
      this.value = value;
    }
}
//启用json解析请求体
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
        result.push(new Item("info","路径变量和请求参数的数据都是透明的，这非常不注重隐私，因此更多时候前端应该将携带的数据放在请求体内进行传输。请求体的形式有很多，最常用的是表单和JSON，请在路径后新增一个路径变量，form-urlencode, multi-form-data或json导向不同的接口进行查看"));
    } else {
        result.push(new Item("error","这个参数不认识"));
    }
    res.send(result);
});
```

#### 接口测试

请使用接口调试工具，带上路径查询参数(query)，然后修改不同的kind为不同的值，去POST访问 localhost:8080/request/data/kind，看看它们的返回结果，注意kind前不要加冒号了，冒号是用来让express知道这段路径是可变的

#### 第二个接口

当第一个接口的某一个分支还可以有后续的操作时，可以再开一个接口以它作为基路由，往后新增动态路径，比如我现在要让body可以再导向不同的分支，就再开一个 /request/data/body/:kind 接口
```js
app.post('/request/data/body/:kind', function (req, res) {
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
        result.push(new Item("lesson","multi-form-data请求体"));
        result.push(new Item("body",req.body));
    } else {
        result.push(new Item("error","这个参数不认识"));
    }
    res.send(result);
});
```

#### 接口测试

请使用接口调试工具，带上JSON请求体，去POST访问 localhost:8080/request/data/body/kind，修改不同的kind，看看它们的返回结果

## 获取路径参数

### 基础

路径参数是指 '/url?id=1&name=evanp' 这种url中的id和name，是明文的不具有隐私性  
可以通过 `req.query`获取
```js
app.post('/request/data/query/info',checkQuery, (req, res)=> {
    res.send(req.query);
});
```
尝试用接口调试工具访问 localhost:8080/request/data/query/info，并携带上任意的query参数

### Query预检

在实际场景中，每个接口会指定需要哪些名字的query参数，假设上面的接口需要id和name，则需要保证前端确实给接口传递了这两个query参数，express没有像springboot那样在入参的时候就可以规定检验，我们必须亲自对传过来的query进行检验。而这部分检验的操作不建议包含在我们接口的主体回调函数内，而应作为一个**中间件**，在回调之前就完成检验:

定义一个检查query的函数，判断是否有id和name，是的话继续，不是的话直接返回错误信息
```js
function checkQuery(req,res) {
    if (req.query.id == undefined ||
        req.query.id == null ||
        req.query.name == undefined ||
        req.query.name == null){
        res.send({"msg": "query不齐全"});
    }
}
```
在接口入参时引入该中间件函数
```js
app.post('/request/data/query/info',checkQuery, (req, res)=> {
    res.send(req.query);
});
```
尝试用接口调试工具访问 localhost:8080/request/data/query/info，并比较不携带id,name和携带了id,name的返回结果

## 获取请求体

### JSON请求体

引入以下代码一次即可
```js
app.use(express.json({type: 'application/json'}));
```

### 表单（x-www-form-urlencoded）

**x-www-form-urlencode**将表单数据编码为URL形式的字符串

引入以下代码一次即可
```js
app.use(express.urlencoded({extended: true}));
```
关于extended参数，是指将（URL编码字符串形式的）表单数据解析为简单对象还是深度嵌套对象.  
什么意思呢？就比如当extended=false时，表单里是这么传数据的: 
其中，有两个相同的键名: 比如传了2个x
解析后该字段的指将是所有它们的值的数组集合：`x=1&x=2` -> `{'x': ['1','2']}`，即便2个x都为1，也是数组: `{'x': ['1','1']}`   
其中，又有的键名是以对象属性格式传递的，比如下图的user[uname]:
![表单传嵌套对象](https://evan-oss-bucket1.oss-cn-hangzhou.aliyuncs.com/express-demo/x-form.png)
假如我们在api调试工具访问之前那个body/form-urlencode接口，同时以表单方式传输了这两种情况的数据，将得到这样的返回结果: 
```json
[
    {
        "name": "lesson",
        "value": "form-urlencode请求体"
    },
    {
        "name": "body",
        "value": {
            "user[uname]": "evanp",
            "user[passwd]": "iloveu",
            "x": [
                "1",
                "2"
            ]
        }
    }
]
```
当extended=true时，则是:  
```json
[
    {
        "name": "lesson",
        "value": "form-urlencode请求体"
    },
    {
        "name": "body",
        "value": {
            "user": {
                "uname": "evanp",
                "passwd": "iloveu"
            },
            "x": [
                "1",
                "2"
            ]
        }
    }
]
```
通过对比我们可以发现，`extended=false`时express比较憨，不会智能解析user到一个对象上去；智能解析的用处，我想大概是省的我们手动一条条注入属性到对象上去了

#### 表单验证

对于请求参数我们有验证的需求，同样的，表单验证自然也会有，甚至可能需求性更高，因为需要考虑到安全问题  
如果没有什么特殊要求，可以自己写一个中间件函数来检查表单，如果有比较高级的需求，可以借助线程的js库，如**express-validator**等

## 表单（multi-form-data）

这个是可以一边传字符串，还可以传文件的表单，其实就是基础表单的一个升级版

需要事先安装**multer**依赖: `npm install multer`  
引入依赖中间件: 
```js
const multer = require('multer');
const uploads = multer();
```

在需要接收文件的接口引入该中间件uploads:
```js
app.post('/request/data/body/:kind', uploads.any(), function (req, res) 
```

在主体回调函数中通过`req.files`可以获取到所有的文件:
```js
console.log(req.files); //写在multi-form-data分支下，方便区分
```

### 测试接口

使用api调试工具的复合表单携带文件发送请求到 body/multi-form-data 接口，查看我们的控制台:
```bash
[
  {
    fieldname: 'file',
    originalname: 'C.jpeg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    buffer: <Buffer ff d8 ff e0 00 10 4a 46 49 46 00 01 01 01 00 48 00 48 00 00 ff db 00 43 00 0a 07 08 09 08 06 0a 09 08 09 0c 0b 0a 0c 0f 1a 11 0f 0e 0e 0f 1f 16 18 13 ... 9752 more bytes>,
    size: 9802
  }
]
```
是的，我刚刚传了一张名为 C.jpeg 的图片到服务器

## 下一章-响应

