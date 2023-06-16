# 数据库初始化

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;在软件开发阶段和测试阶段，为了方便调试，我们通常会进行一系列的数据库初始化操作，比如重置数据表，插入记录等等，或者在部署阶段进行数据初始化的操作

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;根据前面章节介绍过的 `knex.js` 和 `sequelize.js`，我们可以利用它们提供的方法进行DDL，本节就数据库表重置的初始化行为做一点探讨，表结果为`User{id: num, name: string, age: num}`，数据库采用sqlite

## Knex DDL

以下是利用 `knex.schema` 的一个简单示例:  
**knex.js**
```js
const knex = require('knex');
const fs = require('fs');

const sqlClient = knex({
    client: 'sqlite3',
    connection: {
        filename: `${__root}/db/data.db`,
        acquireConnectionTimeout: 1000
    },
    useNullAsDefault: true
});

module.exports = sqlClient;
```
**init.js**
```js
global.__root = __dirname;

const knex = require('./knex.js');

const drop = knex.schema.dropTableIfExists('user');
const create = knex.schema.createTable('user', (user)=>{
    user.increments('id').notNullable().primary();
    user.text('name').notNullable();
    user.integer('age').notNullable()
});
const promises = [drop,create];
Promise.all(promises)
.then(res=>{
    console.log('Database inits successfully!')
}).catch(err=>{
    console.error(err);
})
```

## Sequelize DDL

以下是利用 `Sequelize.Model` 的一个简单示例:  
**sequelize.js**
```js
const { Sequelize,DataTypes,Model } = require('sequelize');
const fs = require('fs');

const sqlClient = new Sequelize({
    dialect: 'sqlite',
    storage: `${__root}/db/data.db`
})

const User = sqlClient.define('User', {
    id: {
        primaryKey: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    age: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'user',
    timestamps: false,
});

module.exports = {
    sqlz: sqlClient,
    User
}
```
**init.js**
```js
global.__root = __dirname;

const { User } = require('./sequelize');

// User.drop();User.sync();
User.sync({ force: true })  //这个相当于前两个的结合体
    .then(res=>{
        console.log('Database inits successfully!');
    }).catch(err=>{
    console.error(err);
})
```

## SQL文件

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Springboot作为Web后端最流行的框架之一，想必各位都接触过或者听说过，在Springboot中，可以在配置文件中设置sql脚本的路径，在项目启动时执行sql脚本来完成初始化。
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;这是一种非常好的方法，因为有时候我们项目场景下的数据库表结构与关系可能非常复杂，而且不同语言，不同框架的实现有些区别，用代码去完成初始化操作将是一件非常麻烦的事，既然SQL是关系型数据库通用的语言，那我们就可以通过SQL脚本来定义数据库表的结构和关系，可以手写SQL脚本，也可以借助如Navicat之类的工具设计表然后转储sql脚本，然后交给我们的程序去执行，或者手动执行。

Node的sql框架千千万，我在几个主流框架中似乎都没看到有提供执行sql文件的特性，其实没那么复杂，不从构造完美的框架角度，仅以为项目服务的角度考虑来说是这样的，接下来我们就来简单实现一下通过sql脚本去初始化数据库。

有两条路：
1. 运行环境先安装sqlite3客户端，node读取sql脚本内容，node通过`exec`去指定目录下，打开sqlite3命令行连接sqlite数据库，同时把sql内容传递过去，在sqlite3中执行sql脚本完成数据库初始化操作
2. Node安装sqlite3依赖，通过sql框架连接sqlite数据库，node读取sql脚本内容，对内容进行规范化处理只剩下纯净的sql语句后，交给sql框架以sql语句的形式去运行

Springboot采用的就是第2种方法，那我们也在Node中实现一下吧  
实现准备好sql脚本 **schemal.sql**：
```sql
-- 先删除user表
DROP TABLE IF EXISTS `user`;
-- 定义表结构，并创建user表
CREATE TABLE `user` (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,  --自增主键
    name TEXT NOT NULL,
    age INTEGER NOT NULL
);

```

### Knex

先用Knex作为sql框架做个示范。获取到项目根目录路径后，建立数据库连接：
**knex.js**
```js
const knex = require('knex');
const fs = require('fs');

const sqlClient = knex({
    client: 'sqlite3',
    connection: {
        filename: `${__root}/db/data.db`,
        acquireConnectionTimeout: 1000
    },
    useNullAsDefault: true
});

module.exports = sqlClient;
```
接下来，为客户端实现执行sql文件的方法：
1. 定义`runSql`方法的传参和返回  
我这里传入sql文件的路径，返回sql语句执行的promise链
2. 内部实现，首先通过`fs`模块读取sql脚本内容并转为字符串
3. 把内容中的注释去掉
4. 去掉内容首尾的空格
5. 去掉`\r`
6. 去掉`\n`（我为了打印sql语段时更加美观，省去了这一步，不影响执行结果）
7. 把内容按照`;`号分割成一个个独立的sql语句字串
8. 过滤掉空字串(由每2个sql语句间的空格形成)

```js
sqlClient.runSql = (path)=>{
    const script = fs.readFileSync(path).toString();
    console.log("Going to run a sql file:");
    console.log(script);
    /**
     * 拆成一句句sql来执行是因为，knex执行一串语句时，会把它们都算进一个事务内
     * 利用正则忽略注释
     * 去首尾空格
     * 按冒号分句
     * 校验字串是否为sql语句
     * @type {string[]}
     */
    const sqls = script.replace(/\/\*[\s\S]*?\*\/|(--|\#)[^\r\n]*/gm, '').trim().replaceAll('\r','').split(';').filter(str=>{
        return str.trim() ? true : false;
    });
    console.log("sqls");
    console.log(sqls);
    console.log("start run:");
    const promises = sqls.map(sql=>{
        sql += ';';  // knex会自动补上冒号，加不加无所谓其实
        console.log("Going to run a sql:");
        console.log(sql);
        return sqlClient.raw(sql);
    })
    return promises;
}
```
到这里，我们就得到了纯净的一条条sql语句，接下来把sql语句丢给`knex`即可：
**init.js**
```js
global.__root = __dirname;

const knex = require('./knex.js')

const promises = knex.runSql(`${__root}/db/schema.sql`);
Promise.all(promises)
    .then(res=>{
        console.log("Database inits successfully!")
    }).catch(err=>{
    console.error(err);
})
```
**输出结果：**
```shell
D:\Workstation\gitee-localRepo\express-demo\DatabaseInit>node index.js
Going to run a sql file:
-- 先删除user表
DROP TABLE IF EXISTS `user`;
-- 定义表结构，并创建user表
CREATE TABLE `user` (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,  --自增主键
    name TEXT NOT NULL,
    age INTEGER NOT NULL
);

sqls
[
  'DROP TABLE IF EXISTS `user`',
  '\n' +
    '\n' +
    'CREATE TABLE `user` (\n' +
    '    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,  \n' +
    '    name TEXT NOT NULL,\n' +
    '    age INTEGER NOT NULL\n' +
    ')'
]
start run:
Going to run a sql:
DROP TABLE IF EXISTS `user`;
Going to run a sql:


CREATE TABLE `user` (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    age INTEGER NOT NULL
);
Server is ready on http://:::8080
Database inits successfully!
```
很好，我们可以很清晰的看到sql的执行过程

### Sequelize

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;如果你把`knex`这套照搬过去，把`knex.raw`换成`sequelize.query`，你也许会尴尬的发现，不太对劲，它先创建了user表，接着又把它给删了，还大言不惭地打印了成功信息（我的环境下是这样，不清楚别人会不会，但既然发生了就说明存在一定的问题）。尝试反复执行knex示例和seuelize示例，前者永远正确，后者永远错误，而且sequelize似乎更慢一点，产生这样的区别，可能是它们执行sql语句的实现机制不太一样，花费精力去看它源码没有必要，既然在这个场景下我们这两个步骤有着明确的先后顺序，那我们就通过async/await让它们完全的顺序执行即可：
```js
sqlClient.runSql = async (path)=> {
    const script = fs.readFileSync(path).toString();
    console.log("Going to run a sql file:");
    console.log(script);
    /**
     * 拆成一句句sql来执行是因为，knex执行一串语句时，会把它们都算进一个事务内
     * 忽略注释
     * 去首尾空格
     * 按冒号分句
     * 校验字串是否为sql语句
     * @type {string[]}
     */
    const sqls = script.replace(/\/\*[\s\S]*?\*\/|(--|\#)[^\r\n]*/gm, '').trim().replaceAll('\r','').split(';').filter(str=>{
        return str.trim() ? true : false;
    });
    console.log("sqls");
    console.log(sqls);
    console.log("start run:");
    for (let sql of sqls) {
        const res = await sqlClient.query(`${sql};`);
    }
}
```
**输出结果：**
```shell
D:\Workstation\gitee-localRepo\express-demo\DatabaseInit>node index.js
Going to run a sql file:
-- 先删除user表
DROP TABLE IF EXISTS `user`;
-- 定义表结构，并创建user表
CREATE TABLE `user` (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,  --自增主键
    name TEXT NOT NULL,
    age INTEGER NOT NULL
);

sqls
[
  'DROP TABLE IF EXISTS `user`',
  '\n' +
    '\n' +
    'CREATE TABLE `user` (\n' +
    '    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,  \n' +
    '    name TEXT NOT NULL,\n' +
    '    age INTEGER NOT NULL\n' +
    ')'
]
start run:
Server is ready on http://:::8080
Executing (default): DROP TABLE IF EXISTS `user`;
Executing (default): CREATE TABLE `user` (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    age INTEGER NOT NULL
);
Database inits successfully!
```
Ok！现在Sequelize也按照我们的意愿完成了重置user表的初始化工作

---

如果初始化过程中涉及严格的先后顺序，务必做好同步流甚至回滚机制。此外，在实际项目中，为了项目的代码规范性，应当将数据库路径，初始化脚本路径都写在配置文件中，而不是像本节为了方便直接写在需要调用的js文件中。