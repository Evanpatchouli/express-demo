# Sql增删改查

本节使用knex作为sql框架，以sqlite数据库为例

## 准备工作

knex是一个运行在各自数据库Driver上的框架，因此需要安装相应的js版数据库Driver，如: PostgreSQL -> pg, mysql/mariadb -> mysql, sqlite -> sqlite3...


- 安装sqlite3依赖 `npm install sqlite3`
- 安装knex依赖 `npm install knex`
- 引入依赖
```js
const app = express();
const knex = require('knex');
```
- 建议安装一款合适的数据库界面工具，笔者使用的是Beekeeper Studio.

## 创建项目

拷贝第一节HelloWorld的项目

## 创建sqlite连接

指明client为sqlite3（刚刚安装的sqlite3依赖），并指明要操作的sqlite数据库路径

```
const sqlite = knex({
    client: 'sqlite3',
    connection: {
      filename: './data.db',
    },
});
```
创建了一个连接实例后，会自动创建一个连接池，因此初始化数据库只会发生一次

### 连接配置

sqlite3默认的是单连接，如果你希望连接池有更多的连接，创建时带上pool:
```js
const sqlite = knex({
    client: 'sqlite3',
    connection: {
      filename: './data.db',
    },
    pool: { min: 0, max: 7 }
});
```

#### 创建连接池的回调

用于检查连接池是否正常，通常不需要这步
```
pool: {
    afterCreate: function (conn, done) {//...}
}
```

#### acquireConnectionTimeout

连接超时时间

#### 日志
knex内置了打印警告、错误、弃用和调试信息的日志函数，如果你希望自定义日志操作，可以在log项里重写它们
```JS
log: {
    warn(message) {
    },
    error(message) {
    },
    deprecate(message) {
    },
    debug(message) {
    }
}
```

## 数据表

### 建表

语法: `sqlite.schema.createTable(表名, table=>{表结构})`

添加一个PUT接口，监听 127.0.0.1:8080/db/:tbname  
根据我们想创建的表名尝试创建一个表，注意: sql执行是异步的，为了得到结果，建议使用 **async/await** 语法糖（当然你就是喜欢地狱回调也不是不行）
```js
app.put('/db/:tbname', async function (req, res) {
    let resultSet = null;
    try {
        // Create a table
        resultSet = await sqlite.schema
          .createTable(req.params.tbname, table => {
            table.increments('id');
            table.string('uname');
            table.string('passwd');
          })
        // Finally, add a catch statement
      } catch(e) {
        console.error(e);
        resultSet = e;
    };
    res.json(resultSet);
});
```

瞅瞅控制台:
```bash
sqlite does not support inserting default values. Set the `useNullAsDefault` flag to hide this warning. (see docs https://knexjs.org/guide/query-builder.html#insert).
```
嗯？sqlite不支持default？不用管他，去看数据库，反正成功创建了user表，你要是加了`useNullAsDefault`这个flag，反而会告诉你` not supported by node-sqlite3`
```js
const sqlite = knex({
    client: 'sqlite3',
    connection: {
      filename: './data.db',
    },
});
```

### 删表

语法: `sqlite.schema.deleteTable(表名)`

```js
app.delete('/db/:tbname', async function (req, res) {
    try {
        // Delete a table
        await sqlite.schema.dropTable(req.params.tbname);
        // Finally, add a catch statement
      } catch(e) {
        console.error(e);
    };
    res.json(null);
});

```

## 表记录crud

### 增

往user表里面插入一条新的记录
```js
app.use(express.json({type: 'application/json'}));
app.put('/db/:tbname/record', async function (req, res) {
    /*前端请求体格式:
    {
        "uname": "evanp",
        "passwd": "iloveu"
    }
    */
   let resultSet = null;
    try {
        // Insert a record
        resultSet = await sqlite(req.params.tbname).insert(req.body);
        // Finally, add a catch statement
      } catch(e) {
        console.error(e);
        resultSet = e;
    };
    res.json(resultSet);
});
```

尝试用api调试工具PUT 127.0.0.1:8080/db/user/record，携带相应的请求体，将会得到`[1]`，这是影响的记录数，1代表成功了

### 查

从user表里查询uname=我们刚刚插入的记录
```js
app.get('/db/:tbname/record', async function (req, res) {
    //前端携带query: uname=evanp
   let resultSet = null;
    try {
        // select a record where uname=xxx
        resultSet = await sqlite(req.params.tbname).select('*').where('uname',req.query.uname);
        // Finally, add a catch statement
      } catch(e) {
        console.error(e);
        resultSet = e;
    };
    res.json(resultSet);
});
```

尝试用api调试工具GET 127.0.0.1:8080/db/user/record?uname=evanp，将会得到:
```json
[
    {
        "id": 1,
        "uname": "evanp",
        "passwd": "iloveu"
    }
]
```

### 改

接下来我们修改uname=evanp这条记录的passwd为123456
```js
app.post('/db/:tbname/record', async function (req, res) {
    //前端携带query: uname=evanp
    /*前端请求体格式:
    {
        "passwd": "123456"
    }
    */
   let resultSet = null;
    try {
        // select a record where uname=xxx
        resultSet = await sqlite(req.params.tbname).update(req.body).where('uname',req.query.uname);
        // Finally, add a catch statement
      } catch(e) {
        console.error(e);
        resultSet = e;
    };
    res.json(resultSet);
});
```
尝试用api调试工具POST 127.0.0.1:8080/db/user/record?uname=evanp，并携带相应请求体，将会得到: [1]，这代表影响记录1条，成功了

### 删

接下来我们删除uname=evanp且passwd=123456的这条记录
```js
app.delete('/db/:tbname/record', async function (req, res) {
    /*前端请求体格式:
    {
        "uname": "evanp",
        "passwd": "123456"
    }
    */
   let resultSet = null;
    try {
        // select a record where uname=xxx
        resultSet = await sqlite(req.params.tbname).del().where(req.body);
        // Finally, add a catch statement
      } catch(e) {
        console.error(e);
        resultSet = e;
    };
    res.json(resultSet);
});
```
尝试用api调试工具DELETE 127.0.0.1:8080/db/user/record，并携带相应请求体，将会得到: [1]，这代表影响记录1条，成功了
## 总结

以上给出了使用knex实现增删改查的基本操作，这些方法并不是唯一的，在实际开发中往往要应对更复杂的场景，基础crud也是远远不够的  
关于knex的更多使用方法，请移步knex官方文档<https://knexjs.org/guide/>

## 下一章-Sql-ORM增删改查