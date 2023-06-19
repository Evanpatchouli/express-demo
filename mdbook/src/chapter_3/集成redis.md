# 集成Redis

本节我们介绍在 express.js 中集成 redis.

Redis是一个高性能的key-value内存数据库，支持事务、队列、持久化等特性，常用于高并发性能场景。

## 准备工作

- 创建一个 express.js 项目（本文基于evp-express-cli）
- 在开发环境下安装redis
- **安装redis.js:**
```console
npm i redis
```

## 创建代理

正常的项目都是分层的，为了避免循环依赖，本文采用代理类构造单例的方式来创建redis连接。

**redisProxy.js:**  
在构造器内创建redis连接，并监听个别事件，最后把连接赋给client成员变量。再定义一个静态的获取实例方法，调用时实例若为空，就构建实例:
```js
const Redis = require('redis');
const logger = require('./logger');

class RedisProxy {
  /**
  * @type {RedisProxy}
  */
  _instance = null;
  constructor() {
    const client = Redis.createClient({
      url: `redis://127.0.0.1:6379`,
    });
  
    client.on('connect', () => {
      logger.info('Redis connected!');
    });
    
    client.on('error', err => {
      logger.error('Redis Client Error!', err);
      process.exit(1);
    });

    client.connect();
    this.client = client
  }

  static instance() {
    if(!this._instance) {
      this._instance = new RedisProxy();
    }
    return this._instance;
  }
}
```

然后把redis导出来:
```js
async function init() {
  return RedisProxy.instance();
}

module.exports = {
  init,
  instance: RedisProxy.instance(),
};
```

然后在任意其它地方调用 redisProxy.instance 即可获取单例，在从单例中获取client即可操作redis.
```js
const RedisProxy = require('../utils/redisProxy');
const redisProxy = RedisProxy.instance;
const redis = redisProxy.client;

redis.set("name", "evpantchouli");  //设置键
console.log(await redis.get("name"); //取键
```


你可以自己手动配置一遍，也可以使用evp-express-cli作为手脚架创建项目并选择redis模板。

关于redis.js的详细用法请见官方文档: <http://npmjs.com/package/redis>

## 下一节-集成RabbitMQ

