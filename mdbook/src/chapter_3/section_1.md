# 全局变量

在 express 中使用全局变量有多种方案，我们一起看看有哪些常用的方案

## 准备工作

拷贝第一节的HelloWorld项目

准备一个Resp.js模块：
```js
module.exports = {
    Ok: (...args)=>{
        return {
            code: 200,
            msg: args[0]?args[0]:"Ok",
            data: args[1]?args[1]:null
        }
    }
}
```

## global

在**global**对象中挂载我们需要全局共享的量，比如我们想要挂载一个全局的config作为整个express应用的配置，就在项目的唯一入口文件（如: index.js, app.js等）的最顶上（优先于任何模块）设置一次：
```js
// index.js
global.config = {
    appname: "GlobalVar"
}
//创建app应用...
```
这样我们就可以在其它任何地方调用config，比如新建一个router.js挂载到express应用上去
```js
// router.js
const routes = require('express').Router();
routes.get('/global', (req, res, next)=>{
    res.send(Resp.Ok("global中的全局变量", {"appname":config.appname}));
});

module.exports = routes;

// index.js
app.use(routes);
```

如果我们有很多需要全局共享的配置，挤在index.js的上方多少有点不雅观，那我们可以把它们写在一个文件里，然后在index.js最顶上引入一下
```js
// global.js
global.config = {
    appname: "GlobalVar"
}

// index.js
require('./global');
```

**注意：**由于global中的变量是可以直接以变量名`xxx`调用的，无需`global.xxx`，如果变量名设置的比较普通，就比如上面的`config`，甚至更简单的`a`之类的，很可能跟其它模块中定义的临时变量冲突，造成变量污染，因此在global上挂载变量时取名一定要特殊点，比如：之前的`config`替换为`__config`
```js
global.__config = {
    appname: "GlobalVar"
}
```

**优点：**
- 调用很便捷

**缺点：**
- 可能变量污染
- 没有代码提示，不心安

## module

自定义一个module，存放一些变量，在需要的地方进行引入  
比如：我们自建一个config.js
```js
// config.js
module.exports = {
    appname: "GlobalVar"
}
```
在router.js中引入config.js
```js
// router.js
const CONFIG = require('./config');

routes.get('/module', (req, res, next)=>{
    res.send(Resp.Ok("config模块当作全局变量", {"appname":CONFIG.appname}));
});
```

**优点：**
- 能有代码提示
- 无变量污染

**缺点：**
- 每次都要引入，比较麻烦

## app.set

在 express 的应用设置表中设置应用内的全局变量：
```js
// index.js
app.set("appname", "GlobalVar");
```
在其它地方调用app，如挂载在app上的router：
```js
// router.js
routes.get('/app', (req, res, next)=>{
    res.send(Resp.Ok("app中的'全局'变量", {"appname":req.app.get("appname")}));
});
```

在挂载在app下的子应用中，调用父app中的设置，当某字段在子应用中没有设置时，会继承父应用中的字段
```js
//subapp.js
const app = require('express')();
const Resp = require('./Resp');
//当子应用没有设置时，会继承父应用中设置的字段
// app.set('appname', "subapp");
app.all('/', (req, res, next) => {
    res.send(Resp.Ok("子应用获取父应用中的全局变量", {
        appname: req.app.get("appname")
    }));
})

module.exports = app;

//index.js
const subapp = require('./subapp');
app.use('/subapp',subapp);
```

**优点：**
- 能有代码提示

## process.env

在进程的环境变量中挂载全局变量：
```js
//index.js
process.env.appname = "GlobalVar";
```
在其它地方调用`process.env.appname`：
```js
// subapp2.js
const app = require('express')();
const Resp = require('./Resp');

app.all('/', (req, res, next) => {
    // console.log(app.settings.env);
    res.send(Resp.Ok("在process.env上挂载全局变量", {
        appname: process.env.appname
    }));
})

module.exports = app;

//index.js
const subapp2 = require('./subapp2');
app.use('/process.env',subapp2);
```

**缺点：**
- 没有代码提示，不心安