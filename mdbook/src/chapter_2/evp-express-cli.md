# evp-express-cli

evp-express-cli 是笔者结合自己的实践经验编写的一款 express 手脚架，以一种比较合适的流程构建的 express 架构。

---

<p>
  <a href="https://www.npmjs.com/package/evp-express-cli"><img alt="npmpackage" src="https://badge.fury.io/js/evp-express-cli.svg"></a>
  <a href="https://nodejs.org/en"><img alt="nodejs" src="https://img.shields.io/badge/NodeJS-16.17+-black.svg"></a>
  <a href="https://www.npmjs.com/package/express"><img alt="express" src="https://img.shields.io/badge/Express-4.x-%23007fff.svg"></a>
</p>

[![Security Status](https://www.murphysec.com/platform3/v31/badge/1671461396351311872.svg)](https://www.murphysec.com/console/report/1671461396074487808/1671461396351311872)

## 文档

- [安装](#安装)
- [用法](#用法)
  + [命令](#命令)
  + [新建项目](#新建项目)
  + [运行](#运行)
  + [模板](#模板)
    * [验证](#验证)
    * [数据库](#数据库)
    * [Redis](#redis)
    * [Auth](#auth)
    * [RabbitMQ](#rabbitmq)
    * [SocketIO](#socketio)
    * [Nacos](#nacos)
  + [开发工具](#开发工具)
    * [Babel](#babel)
    * [Esint](#eslint)
    * [Jest](#jest)
    * [Pkg](#pkg)
    * [PM2](#pm2)
  + [资源](#资源)
  + [配置](#配置)
  + [日志](#日志)
  + [异常处理](#异常处理)

## 安装

安装到局部目录
```shell
npm i evp-express-cli -D
```
或者全局安装
```shell
npm i evp-express-cli -g
```

## 用法

这里是一些示例。

### 命令

`evp-express`: 
 - `-v`, `--version`: 显示版本
 - `-i`, `--info`: 显示详细信息
 - `-h`, `--help`:  显示帮助信息
 - `new <projectName>`:  以一个特定的名字新建项目
 - `start`: 启动开发服务器
 - `clean <path>`: 删除指定路径所有文件
 - `add <template>`: 添加指定的模板或开发工具

### 新建项目

不提前安装手脚架，直接从 npm 仓库拉取:
```shell
npx evp-express-cli new <projectName>
```
手脚架局部安装时:
```shell
npx evp-express new <projectName>
```
手脚架全局安装时:
```shell
evp-express new <projectName>
```

### 运行

切换至项目根目录下，通过以下命令运行: 
手脚架局部安装时:
```shell
npx evp-express start
```
手脚架全局安装时:
```shell
evp-express start
```
或者直接通过 npm 脚本:
```shell
npm run start
```
或者直接通过 node:
```shell
node index
```

### 模板


#### 验证

验证中间件位于 /midwares/valider.js

它导出了这些东西:
```js
module.exports = {
  validator,
  ValidRace,
  ValidAll,
  ValidQueue,
  ValidQueueAll
}
```
- validator 是 "express-validator"。
- ValidRace 是并发的验证检验链，并抛出最早检验出错误的那个。
- ValidAll 是并发的验证检验链，并抛出全部错误。
- ValidQueue 是串行的验证检验链，并抛出最早检验出错误的那个。
- ValidQueueAll 是串行的验证检验链，并抛出全部错误。

示例:
```js
const { validator, ValidQueue } = require('../midwares/valider');

router.get('/',
  ValidQueue([
    validator.query('name').trim().notEmpty().withMessage("name cannot be empty"),
    validator.query('age').trim()
      .notEmpty().withMessage("age cannot be empty").bail()
      .isInt().withMessage("age must be Int").bail().toInt()
  ]),
(req, res, next) => {
  res.send(`Hello ${req.query.name}, you are ${req.query.age} years old!`);
});
```
你将会得到如下结果:
```json
{
  "code":500,
  "msg":"name cannot be empty",
  "data":null,
  "symbol":-1,
  "type":"Bad Request"
}
```

#### 数据库

数据库模板使用 **mysql** 作为默认数据源， **mysql2** 作为默认数据驱动 和 **knex.js**作为默认数据库客户端.

你可以引用 knex-sqlClient 通过 `const { sqlClient } = require('utils/knex');`.

你可以更换任意其它的数据库，驱动和客户端. 但我强烈 **建议你不要** 删除 `utils/knex` 因为这个框架使用它去初始化数据库。

更多的配置信息可以在config.yaml找到.

#### Redis

Redis模板依赖于 **redis.js** 丙炔不附带身份认证, 如果你需要的话可以修改 `utils/redisProxy`.

你可以引用 redisProxy 通过 `const { instance } = require('utils/redisProxy');`. 你可以使用 `instance.client` 去获取redis客户端实例。

更多的配置信息可以在config.yaml找到.

#### Auth

认证模板只是安装了 **passport.js** 你需要自行配置。

#### RabbitMQ

RabbitMQ模板依赖于 **ampqlb.js** 并使用 "guest:guest" 作为默认用户.

你可以引用 异步的 rabbitmqProxy 通过 `const { instance } = require('utils/rabbitmqProxy');`. 你可以使用 `instance.conn` 去获取 rabbitmq连接实例.你可以使用 `instance.channel` 去获取rabbitmq的默认通道实例。

**注意它是一个promise**, 当被在任何地方引用时，请使用异步语法糖去获取实例，或者通过同步流的方式。
```javascript
const { instance } = require('../utils/rabbitmqProxy');

app.get('/', async(req, res)=>{
const rbmqProxy = await instance;
  const { channel: rbmq } = rbmqProxy;
  rbmq.sendToQueue("queue", "hello");
})
```
**Or like this:**
```javascript
const RabbitmqProxy = require('../utils/rabbitmqProxy');

app.get('/', async(req, res)=>{
  const rbmqProxy = await RabbitmqProxy.instance;
  const { channel: rbmq } = rbmqProxy;
  rbmq.sendToQueue("queue", "hello");
})
```
**Or like this:**
```javascript
const amqplib = require('amqplib');
const RabbitmqProxy = require('../utils/rabbitmqProxy');

//@type {amqplib.Channel}
let rbmq = null;
RabbitmqProxy.instance.then(rabbitmq=>{
  rbmq = rabbitmq.channel;
})

app.get('/', async(req, res)=>{
  rbmq.sendToQueue("queue", "hello");
})
```

更多的配置信息可以在config.yaml找到.

#### SocketIO

SocketIO模板依赖于 **socket.io** 并且挂载服务器于 express-http-server 上.

你可以引用 socketioProxy 通过 `const { instance } = require('utils/socketioProxy');`. 你可以使用 `instance.server` 去获取 SocketIO 服务器实例。

更多的配置信息可以在config.yaml找到.

#### Nacos

Nacos模板依赖于 **nacos.js** 并且默认使用你项目的包名作为服务名。

你可以引用 nacosClient 通过 `const { instance } = require('utils/nacosProxy');`. 你可以使用 `instance.client` 去获取 Nacos 客户端实例。

更多的配置信息可以在config.yaml找到.

### 开发工具

#### Babel

Babel工具只是安装了基本的依赖和创建了一个配置文件。

你需要更多的自定义它。

#### Eslint

Eslint工具只是安装了基本的依赖

你需要更多的自定义它。

#### Jest

Jest工具只是安装了基本的依赖和创建了一个配置文件。此外, `package.json's scripts.test` 被替换为 "jest",你可以使用Jest进行快速测试通过 "npm test"命令.

你需要更多的自定义它。

#### Pkg

Pkg工具用于构建可执行的exe程序，输出目录为dist。

`package.json's scripts.build` 被替换为 "npx pkg . --out-path dist -t node16-win-x64". 你可以进行快速的构建通过"npm build"命令. 默认的编译目标是 node16-win-x64, 你可以在 package.json 中修改它并且你通常需要去Github上下载对应的目标node.

#### PM2

PM2是一个由node驱动的进程管理器. 框架创建了一个基础的配置文件(ecosystem.consig.js)

你可以更多的自定义它。

### 资源

框架将assets目录当作资源目录，请不要修改它！

### 配置

绝大多数配置信息被写在 assets/config.yaml 中. 你可以引用config通过 `global.__config` 或者 `__config`.

### 日志

日志工具位于 /utils/logger.js

### 异常处理

异常处理中间件位于 /midwares/exhandler.js

导出了两个中间件: 捕捉和日志.
```js
module.exports = {
  excatcher: (err, req, res, next) => {
    if (err) {
      const {code,msg,symbol,data,back} = err.message;
      if (back != false && code) {
        if (code) {
          if (code == 400) {
            res.json(Resp.fail(msg, symbol??-1, data??null));
          }
          if (code == 500) {
            res.json(Resp.bad(msg, symbol??0, data??null));
          }
        } else {
          res.json(Resp.bad(err.message));
        }
      }
      next(err);
    } else {
      next();
    }
  },

  exlogger: (err,req,res,next)=>{
    if (logger.level.level <= 10000) {
      logger.error(err);
      return;
    }
    logger.error(err.message);
  }
}
```
通常，在捕获全局异常后，默认的是坏响应，但有时候我们不想要坏响应。
```javascript
throw new Error(JSON.stringify({code:400,msg:"Invalid arguments."});
```
甚至我们可能不需要返回响应，我们可以把 back 设置为 "false"。
```javascript
throw new Error(JSON.stringify({code:400,msg:"Invalid arguments.",back:false});
```
框架只预置了 200 和 400 两个code，你可以自行拓展。

---

感谢您的使用!😊🥰

## 下一章-高级进阶