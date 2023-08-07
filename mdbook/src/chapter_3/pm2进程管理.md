# pm2进程管理

本节我们将介绍如何使用 pm2 运行和监管我们的 express 项目

## 准备工作

- 一个 express 项目
- 全局安装 pm2 
```shell
npm install -g pm2
```

## pm2使用介绍

### 启动应用

你可以用纯命令去运行一个node项目，假设原本运行项目使用 `node src/index.js`可以跑起来一个项目，则：
```shell
pm2 start -name "pm2-node-app" node -- src/index
```

当然你还可以通过将部分信息写到配置文件中，文件可以是 js, json 等，js格式的可以通过以下命令生成：
```shell
pm2 init
```
这将得到一个名为 "ecosystem.config.js" 的文件，内容如下：
```js
module.exports = {
  apps : [{
    script: 'index.js',
    watch: '.'
  }, {
    script: './service-worker/',
    watch: ['./service-worker']
  }],

  deploy : {
    production : {
      user : 'SSH_USERNAME',
      host : 'SSH_HOSTMACHINE',
      ref  : 'origin/master',
      repo : 'GIT_REPOSITORY',
      path : 'DESTINATION_PATH',
      'pre-deploy-local': '',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
```
deploy那部分是构建，在本节我们仅将 pm2 用于项目的运行管理，无需关注构建。重点是 apps 列表，每一个元素分别对应一个应用的配置信息，包括启动时运行的脚本命令（script），文件变动监控（watch）等

### 热重载

假设我们的源码入口位于 "src\index.js"，我们需要开发时热重启项目（仅src内文件变动）：
```js
module.exports = {
  apps : [{
    script: 'src/index.js',
    watch: ['src']
  }]
};
```

pm2根据这个文件去运行应用时可以直接这样：
```shell
pm2 start  // 与ecosystem.config.js同目录
```

如果你使用其它的配置文件，如 json，配置的格式也是类似的，则需要向pm2指明该配置文件名，如：
```shell
pm2 start app.json
```

### 管理应用

- `pm2 stop <id|name|namespace|all|json|stdin>`：停止指定的应用
- `pm2 restart <id|name|namespace|all|json|stdin>`：重启指定的应用
- `pm2 reload <id|name|namespace|all|json|stdin>`：即刻重载web应用
- `pm2 delete <id|name|namespace|all|json|stdin>`：删除指定的应用

### 应用监控

- `pm2 ls`：终端中查看所有应用状况
- `pm2 monit`：打开终端的监控面板
- `pm2 plus`：在浏览器中的Dashboard，使用 `pm2 plus` 可能会报错，可以直接访问网址<https://app.pm2.io/>

### 查看日志

- `pm2 log`：查看所有应用日志
- `pm2 log <id|name|namespace|all|json|stdin>`：查看指定日志

### 应用集群

你可以将一系列应用划分到一个命名空间内作为一个集群，通过指定namespace，进行全体的重启等操作。
以 ecosystem.config.js 为例，这一组应用包含了2个 node 应用：

```js
module.exports = {
  apps : [{
    name: 'express-app1',
    script: './app1/src/index.js',
    watch: './app1/src',
    namespace: 'express-demo'
  }, {
    name: 'express-app2',
    script: './app2/src/index.js',
    watch: './app2/src',
    namespace: 'express-demo'
  }]
};
```

关于 pm2 更多的使用技巧，还请诸君自行探索

---

## 下一章节-最佳实践