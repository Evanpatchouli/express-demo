# 集成RabbitMQ

本节我们介绍在 express.js 中集成 rabbitmq.

RabbitMQ 是一个消息队列中间件，常用于请求削峰，事务的队列处理，事件订阅机制的实现等。

## 准备工作

- 创建一个 express.js 项目（本文基于evp-express-cli）
- 在开发环境下安装rabbitmq
- **安装amqplib.js:**
```console
npm i amqplib
```

## 创建代理

正常的项目都是分层的，为了避免循环依赖，本文采用代理类构造单例的方式来创建ampqlib连接。

**redisProxy.js:**  
在构造器内创建redis连接，并监听个别事件，最后把连接赋给client成员变量。再定义一个静态的获取实例方法，调用时实例若为空，就构建实例:
```js
const amqplib = require('amqplib');
const logger = require('./logger');

class RabbitmqProxy {
  /**@type {RabbitmqProxy}*/
  _instance = null;
  /**@type {amqplib.Connection}*/
  conn;
  /**@type {amqplib.Channel}*/
  channel;

  static async instance() {
    if (!this._instance) {
      let ins = new RabbitmqProxy();
      const conn = await amqplib.connect({
        username: `guest`,
        password: `guest`,
        hostname: `127.0.0.1`,
        port: `5672`,
      });
      logger.info("Connected to RabbitMQ!");
      ins.conn = conn;
      const channel = await ins.conn.createChannel();
      //确认队列
      channel.assertQueue("hellos");
      //订阅队列
      channel.consume("hellos", async (message) => {
      	console.log("hello, two!");
      	channel.ack(message); //报告处理完毕
      });
      ins.channel = channel;
      this._instance = ins;
    }
    return this._instance;
  }
}
```
amqplib创建rabbitmq连接是异步的，所以获取实例的静态方法也是异步的，如果你想转为同步函数，只能通过进程阻塞的方式实现。上面给我们的rabbitmq客户端订阅了一个hellos队列。

然后把rabbitmq导出来:
```js
async function init() {
  return RedisProxy.instance();
}

module.exports = {
  init,
  instance: RedisProxy.instance(),
};
```

然后在任意其它地方调用 await rabbitmqProxy.instance 即可获取单例，在从单例中获取conn和channel即可操作rabbitmq.
```js
const rabbitmqProxy = require('../utils/rabbitmqProxy');

app.post('/', async(req,res,next)=>{
	const rbmqproxy = await rabbitmqProxy.instance;
	const channel = rbmqproxy.channel;
	//发送消息到"hellos"队列
    channel.sendToQueue("hellos", "hello!");
    res.send();
})
```


你可以自己手动配置一遍，也可以使用evp-express-cli作为手脚架创建项目并选择rabbitmq模板。

关于amqplib.js的详细用法请见官方文档: <http://npmjs.com/package/amqplib>

## 下一节-集成Websocket

