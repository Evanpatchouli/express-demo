# 集成SocketIO

本节我们介绍在如何在 express 中集成 Socket.IO

Socket.IO 算是 WebSocket 的一个超集，进行了一些封装和拓展。

## 准备工作

- 创建一个 express.js 项目（本文基于evp-express-cli）
- **安装socket.io.js:**
```console
npm i socket.io
```

## 创建代理

正常的项目都是分层的，为了避免循环依赖，本文采用代理类构造单例的方式来创建websocket服务器。

**wsProxy.js:**  
在构造器内创建socket.io服务器，并监听个别事件，最后把服务器赋给server成员变量。再定义一个静态的获取实例方法，调用时实例若为空，就构建实例:
```js
const { Server } = require('socket.io');
const server = require('./server');
const logger = require('./logger');

class SocketIoProxy {
  /**
   * @type {Server}
   */
  _instance = null;
  constructor() {
    this.server = new Server(server);
    logger.info('SocketIo server created!');
    this.server.on('connection', (socket) => {
      socket.on('message', (data) => {
        logger.info(`client: ${JSON.stringify(data)}`);
        socket.emit('message', data);
      });
    });
  }

  static instance(){
    if(!this._instance){
      this._instance = new SocketIoProxy();
    }
    return this._instance;
  }
}

async function init() {
  return SocketIoProxy.instance();
}

module.exports = {
  init,
  instance: SocketIoProxy.instance()
}

```

最后把服务器导出来:
```js
async function init() {
  return RedisProxy.instance();
}

module.exports = {
  init,
  instance: RedisProxy.instance(),
};
```

然后在任意其它地方调用 socketioProxy.instance 即可获取单例，在从单例中获取server即可主动操作socketio.
```js
const SocketioProxy = require('../utils/socketioProxy');
const socketioProxy = SocketioProxy.instance;
const socketioServer = socketioProxy.server;
```

你可以自己手动配置一遍，也可以使用evp-express-cli作为手脚架创建项目并选择socketio模板。

关于 socket.io 的详细用法请见官方文档: <https://socket.io/zh-CN/>

## 下一节-全面鉴权