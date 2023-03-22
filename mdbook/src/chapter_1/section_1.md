# Hello World

本节我们将创建并运行我们的第一个express.js项目，并使用最简单的请求响应

## 准备工作

- 本书系统环境为 **windows10 64Bit**  
- 请事先在你的开发环境中安装 **Node.js**，本书使用的是 **node v16.17.1**  
- 推荐使用 **VsCode** 作为开发工具，有良好的代码提示功能  
- 事先安装一个api调试工具，如 **postman**, **apipost**等

## 创建项目

1. 创建一个文件夹作为项目根目录
2. 下载express依赖  
在根目录下执行`npm install express`  
3. 下载js-text-chart依赖  
在根目录下执行`npm install js-text-chart`，这是一个用于输出字符画的js库，本书在每一个示例中都使用了该库充当starter  
4. 在根目录下新建一个入口文件，如**index.js**
5. 在入口文件中引入依赖
```js
const express = require('express');
const evchart = require('js-text-chart').evchart;
```

## 创建服务器

1. 先创建一个express实例
```js
const app = express();
```
2. 创建服务器

让我们刚刚创建的app实例挂载到指定的端口，如8080
```js
const server = app.listen(8080);
```
3. 添加服务器运行后的回调函数

是指在服务器成功运行后的一系列操作，常用于输出信息和初始化等，我在这里打印该项目的基本信息  
我使用的是内联箭头函数 "()=>{//...}"，也可以替换为普通的"function {//...}"
```js
const server = app.listen(8080, () => {
    let host = server.address().address;
    let port = server.address().port;

    let str = "EXPRESS-DEMO";
    let mode = [ "close", "far", undefined ];
    let chart = evchart.convert(str, mode[0]);
    console.log(chart);

    console.log("Server is ready on http://%s:%s", host, port);
})
```

4. 跨域策略

默认情况下可能不允许不同域名下进行交互，我们对请求进行一些基本的设置，允许跨域和所有的请求方式请求头格式化，并设置请求头内容为json格式
```js
app.all("*", function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Methods", "*");
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});
```

## 第一个接口

### 概念

前后端交互是在后端暴露的接口进行的，而不同的接口对于后端端口上不同的url路径。前端使用不同的方式（GET,POST...）请求指定的路径，当后端有定义监听某种方式下的某种路径接口时，获取请求携带的数据，对请求进行处理，并返回结果给前端 

### 实践

接下来，我们将添加一个以服务器的根路径（GET）作为返回欢迎信息的接口
```js
app.get('/', function (req, res) {
    res.send('Hello World!');
});
```
以上代码，app实例**监听** **localhost:8080/** 路径的**GET**请求，传入2个参数，第一个是请求，第二个是响应  
当接收到以GET方式访问该接口的请求时，通过在回调函数中执行`res.send`返回 Hello World!

### 测试接口

使用接口测试工具，以GET的形式访问localhost:8080/试试吧！你将会得到一句 Hello World!

## 第二个接口

第一个接口，我们只是单纯的访问了接口，没有传输任何数据，接下来我们将创建一个以传统的路径请求参数（如: url?id=1）携带数据的接口

### 实践

定义一个GET形式，路径为 /get 的接口，传入2个参数请求和响应，我们在回调函数中通过`req.query`来获取路径上的所有请求参数，并将这些参数作为接口的返回值
```js
app.get('/get', function (req, res) {
    let requestParams = req.query;
    res.send(requestParams);
});
```

### 测试接口

使用接口测试工具，以GET的形式访问 localhost:8080/get?id=1&name=evanp 试试吧！你将会得到这两个参数!

## 下一节-请求类型
