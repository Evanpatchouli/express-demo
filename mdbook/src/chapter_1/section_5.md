# Sql-ORM增删改查

ORM框架: 对象关系映射，面对对象sql  
本节使用sequelize作为orm-sql框架，数据库为sqlite

## 准备工作

同样的，需要安装相应的js版数据库Driver，如: PostgreSQL -> pg, mysql/mariadb -> mysql, sqlite -> sqlite3...

- 安装sqlite3依赖 `npm install sqlite3`
- 安装sequelize依赖 `npm install sequelize`
- 引入依赖
```js
const app = express();
const { Sequelize } = require('sequelize');
```
- 建议安装一款合适的数据库界面工具，笔者使用的是Beekeeper Studio.

## 创建项目

拷贝第一节HelloWorld的项目

## 创建sqlite连接

指定方言为sqlite，持久化路径为本目录下的data.db
```js
const sqlite = new Sequelize({
    dialect: 'sqlite',
    storage: './data.db'
})
```

## 定义表模型

sequelize主打一个面对对象sql，因此我们要建立一个对应数据表的类  
就和上一节一样，弄一张一模一样的user表吧:

- 引入DataTypes
```
const { Sequelize,DataTypes } = require('sequelize');
```
- 定义User对象

`Model.init(schema,options)`
```js
const User = sqlite.define('User', {
    id: {
        primaryKey: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true
    },
    // 在这里定义模型属性
    uname: {
      type: DataTypes.STRING,
      allowNull: true
    },
    passwd: {
      type: DataTypes.STRING
      // allowNull 默认为 true
    }
  }, {
    // 直接指定表名，不指定的话sequelize将默认以模型的复数形式作为表名
    tableName: 'user'
});
```
还有另一种方法，效果是一样的，看个人喜好使用:

- 额外引入Model
```js
const { Sequelize,DataTypes,Model } = require('sequelize');
```
- 初始化User类

`Model.init(schema,options)`
```js
User继承Model类
class User extends Model {};
User.init(
    {
        id: {
            primaryKey: true,
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true
        },
        // 在这里定义模型属性
        uname: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        passwd: {
            type: DataTypes.STRING，
            defaultValue: '123456', //默认值
            //allowNull 默认为 true
        }
    }, 
    {
        // 这是其他模型参数
        sqlite, // 我们需要传递连接实例
        modelName: 'User1', // 我们需要选择模型名称,
        // 直接指定表名
        tableName: 'user',
    }
);
```

## 模型同步

`Model.sync`: 底层执行的是 create table if not exist
- 如果数据库中不存在对应的表，将根据模型直接创建表；若存在，不操作  
`Model.sync({force: true})`: 底层是先 drop if 然后 create
- 如果表已存在，将删除再根据模型创建表  
`Model.sync({alter: true})`: 
- 如果表已存在，将修改表结构使之与模型匹配

花里胡哨的，总之就是保证数据库中有和该模型对应的表

## 创建user表

我们使用`User.sync()`创建一张user表

```js
app.put('/db/user', async function (req, res) {
    let what = await User.sync();
    res.json(what);
});
```

使用api调试工具PUT 127.0.0.1:8080/db/user，将会得到1，注意只要能成功映射到到数据表都是1

用Beekeeper查看我们的user表，你会发现和我们定义的模型有点不一样：多了2个字段——createdAt和updatedAt，即创建时间和修改时间  
sequelize会自动管理这两个字段，注意当你使用了其他的sql工具修改表，这两个字段不会自动更新

如果你不想要这两个值，或者想换个名字，可以在定义模型时往options添加这些设置:
```js
// 禁止createdAt和updatedAt
timestamps: false,
// 只禁止createdAt
createdAt: false,
// 给updatedAt换个名字
updatedAt: 'updateTime'
```

## 删除user表

drop()方法，底层是 drop if，既可以作用于模型，也可作用于数据库:
```js
sqlite.drop();  //这将删除当前data.db下所有的表
```

我们使用`User.drop()`来删除user表

```js
app.delete('/db/user', async function (req, res) {
    let what = await User.drop();
    res.json(what);
});
```

使用api调试工具PUT 127.0.0.1:8080/db/user，将会得到1，注意即使表已经没了，也是1

## 数据表crud

### 增

在操作表记录前，我们先通过模型(`Model.build`)创建一个实例，然后调用`save()`将这个实例插入到表中  
当然，如果你从前端拿来的数据不需要进行处理和转化就能拿来用，也可以直接用`Model.create`插入记录

```js
app.use(express.json({type: 'application/json'}));
app.put('/db/user/record', async function (req, res) {
    /**前端请求体
    {
        "uname": "evanp",
        "passwd": "iloveu"
    }
    */
    try {
        let user = User.build(req.body);
        let what = await user.save();
        // let what = await User.create(req.body);
        res.json(what);
    }catch(e){
        res.json(e);
    }
});
```


使用api调试工具PUT 127.0.0.1:8080/db/user/record，携带相应的请求体，将会得到:
```json
{
    "id": 1,
    "uname": "evanp",
    "passwd": "iloveu",
    "updatedAt": "2023-03-19T08:03:37.964Z",
    "createdAt": "2023-03-19T08:03:37.964Z"
}

```
是的，添加记录成功后它会顺便把整条记录查出来作为返回结果

Ok，那么现在user表里已经有了id=1的一条记录了，让我们试一下创建相同id的记录会怎么样...  
服务器直接挂了，我们可不希望这样，这意味着有任何不妥的sql都可能导致服务器崩溃，那怎么办呢？

有的朋友可能记起来了，在上一节中，使用了try-catch语法糖包裹sql操作，这是一种不错的方法

### 查

sequelize模型内置了一些方法使得我们可以基于模型直接查询

- findAll 查找全部，底层是`select * from ...`
- findOne 查找一个，底层是`select * from ... LIMIT 1`
- findByPk 根据主键查找
- findAndCountAll 查找并返回符合的总条数，常用于分页
- findOrCreate 找不到就创建

这些方法都可以添加options参数设置WHERE,LIMIT等限制条件  
我们使用findOne来查询evanp和用户名和密码都对的上的一条记录:

```js
//我为了方便直接url传参了，实际上为了隐私，至少应该放在请求体内
app.get('/db/user/record', async function (req, res) {
    let evanp = await User.findOne({where: req.query});
    res.json(evanp);
});
```

如果你只需要查询其中某些字段，就在options中设置attributes:
```js
User.findAll({
    attributes: ['id','uname']
});
```
如果想给字段取别名，就比如像这样给id取名uid:
```js
User.findAll({
    attributes: [['id','uid'],'uname']
});
```

## 改

`Model.update(修改项,限制)`
```js
app.post('/db/user/record', async function (req, res) {
    /*请求体
    {
        "set":{
            "passwd": "123456"
        },
        "where": {
            "uname": "evanp",
            "passwd": "iloveu"
        }
    }
    */
    let what = await User.update(req.body.set,{where: req.body.where})
    res.json(what);
});
```

使用api工具进行调试，修改成功将返回1，修改失败将返回0(找不到/改不了)

## 删

`Model.destroy(限制)`
```js
app.delete('/db/user/record', async function (req, res) {
    /*请求体
    {
        "uname": "evanp",
        "passwd": "123456"
    }
    */
    let what = await User.destroy({where: req.body})
    res.json(what);
});
```

使用api工具进行调试，删除成功将返回1，删除失败将返回0(找不到/删不了)


## 原生Sql

当然了，如果你需要直接使用sql语句，也是可以的，`连接实例.query(sqlStr)`即可  
通常，返回结果包含2个值，一个是结果数组，一个是相关信息
```js
app.post('/db/user/record/freely', async function (req, res) {
    /*json请求体
    {
        "sql": "xxx"
    }
    */
    let what = null;
    try {
        what = await sqlite.query(req.body.sql);
    } catch (e) {
        what = e;
    }
    res.json(what);
});
```
执行insert前要注意，如果这张表是经过sequelize同步的，也许会有那两个时间字段的，别忘了

本节的例子仅仅为了演示在express.js中如何运用sequelize操作数据库，关于sequelize的更多拓展和高级使用方法，请移步sequelize官方文档<https://www.sequelize.cn/>


## 下一章-路由控制