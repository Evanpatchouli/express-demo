# express-cli

首先介绍一下express官方的手脚架

## 搭建

- 创建一个目录
- 进入项目，终端内暗转express
```shell
npm install express
```
- 利用express打架基础项目
```shell
express
```
- 安装基础项目的依赖
```shell
npm install
```

你将获得这样的一个项目，可以通过`npm run start`运行:
```text
│  app.js
│  package-lock.json
│  package.json
│
├─bin
│      www
│
├─node_modules
├──//...
│
├─public
│  ├─images
│  ├─javascripts
│  └─stylesheets
│          style.css
│
├─routes
│      index.js
│      users.js
│
└─views
        error.jade
        index.jade
        layout.jade
```

app.js是整个程序的入口文件，package.json是项目配置文件，node_modules是项目依赖，public是存放静态资源的目录，routes是存放我们定义的路由模块的目录，views是渲染层目录(里面的.jade是node.js的一种页面渲染模板)，bin是脚本目录  

## 启动脚本
bin目录下的www，其实就是一个写好的脚本，用来挂载express应用并启动服务器的:  
引入了app.js，设置了端口，创建了一个服务器，定义了错误监听和成功监听端口时的回调，基本上就这么一些东西

## 静态目录
public没什么可说的，就存放静态资源的，如果是当作纯后端，就放点图片、LOGO、以及初始化文件之类的，前后端一体的话还多些css和js脚本等

## views
一体的前端，渲染模板用的jade，我不会，跳过

## routes
专门放定义的路由/接口，我们看其中一个:  
写完一个路由，然后导出，就这样
```js
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;

```
当然，你也可以不止写一个路由，写成聚合路由集群，或者导出多个也是可以的，一般同属一个小模块的可以放在一个文件里

## 补充

这个手脚架的结构就这么简单，实际开发中，我们肯定要加添加更多的目录，比如存放类的目录，存放封装好的sql或者工具函数的目录，存放自定义的中间件目录等等

本身express就是个轻量级框架，简单意味着你可以更加自由的组装你的项目结构

## 下一节-MVC层级架构
