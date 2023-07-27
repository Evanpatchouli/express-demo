# 集成websocket

本节我们介绍在如何在 express 中集成 websocket。

WebSocket 服务器可以主动向客户端推送信息，客户端也可以主动向服务器发送信息，是真正的双向平等对话，属于服务器推送技术的一种。

## 准备工作

- 创建一个 express.js 项目（本文基于evp-express-cli）
- **安装ws.js:**（本教程使用更通用的ws.js，有兴趣的同学可以去了解express-ws.js）
```console
npm i ws
```

## 创建代理

正常的项目都是分层的，为了避免循环依赖，本文采用代理类构造单例的方式来创建websocket服务器。

**wsProxy.js:**  
在构造器内创建websocket服务器，并监听个别事件，最后把服务器赋给server成员变量。再定义一个静态的获取实例方法，调用时实例若为空，就构建实例:
```js
const {WebSocketServer} = require('ws');

class WebsocketProxy {
  /**@type {WebsocketProxy} */
  static INSTANCE;
  server;
  constructor() {
    const _server = new WebSocketServer({
      server: require('./server')
    })

    this.server = _server;
    
    _server.on("listening", () => {
      console.log(`websocket server is listening.`);
      
    })

    _server.on("connection", (ws) => {
      console.log(`websocket client connection`);
      ws.send(`Hello, I'm WebSocket server.`);
      ws.on("message", (message) => {
        ws.send(`${message}`);
      })
    })
  }

  static instance() {
    if(!WebsocketProxy.INSTANCE) {
      WebsocketProxy.INSTANCE = new WebsocketProxy();
    }
    return WebsocketProxy.INSTANCE;
  }
}

function init() {
  return WebsocketProxy.instance();
}

module.exports = {
  init
};
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

然后在任意其它地方调用 wsProxy.instance 即可获取单例，在从单例中获取server即可主动操作websocket.
```js
const WsProxy = require('../utils/wsProxy');
const wsProxy = WsProxy.instance;
const wsServer = wsProxy.server;
```

你可以自己手动配置一遍，也可以使用evp-express-cli作为手脚架创建项目并选择websocket模板。

关于 ws.js 的详细用法请见官方文档: <https://www.npmjs.com/package/ws>

## 下一节-集成SocketIO