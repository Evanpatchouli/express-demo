const express = require('express');
const evchart = require('js-text-chart').evchart;
const { Sequelize,DataTypes,Model } = require('sequelize');

const app = express();

const sqlite = new Sequelize({
    dialect: 'sqlite',
    storage: './data.db'
})

app.all("*", function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Methods", "*");
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

app.get('/', function (req, res) {
    res.send('Hello World!');
});

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
      type: DataTypes.STRING,
      defaultValue: '123456',   //默认值
      // allowNull 默认为 true
    }
  }, {
    // 直接指定表名，不指定的话sequelize将默认以模型的复数形式作为表名
    tableName: 'user',
    // // 禁止createdAt和updatedAt
    // timestamps: false,
    // // 只禁止createdAt
    // createdAt: false,
    // // 给updatedAt换个名字
    // updatedAt: 'updateTime'
});

// User继承Model类
// class User extends Model {};
// User.init(
//     {
//         id: {
//             primaryKey: true,
//             type: DataTypes.INTEGER,
//             allowNull: false,
//             autoIncrement: true
//         },
//         // 在这里定义模型属性
//         uname: {
//             type: DataTypes.STRING,
//             allowNull: true
//         },
//         passwd: {
//             type: DataTypes.STRING
//             allowNull 默认为 true
//         }
//     }, 
//     {
//         // 这是其他模型参数
//         sqlite, // 我们需要传递连接实例
//         modelName: 'User1', // 我们需要选择模型名称,
//         // 直接指定表名
//         tableName: 'user'
//     }
// );

app.put('/db/user', async function (req, res) {
    let what = await User.sync();
    res.json(what);
});

app.delete('/db/user', async function (req, res) {
    let what = await User.drop();
    res.json(what);
});

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

app.get('/db/user/record', async function (req, res) {
    // let evanp = await User.findByPk(1);
    let evanp = await User.findOne({where: req.query});
    res.json(evanp);
});

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

app.post('/db/user/record/freely', async function (req, res) {
    /*请求体
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


const server = app.listen(8080, () => {
    let host = server.address().address;
    let port = server.address().port;

    let str = "EXPRESS-DEMO";
    let mode = [ "close", "far", undefined ];
    let chart = evchart.convert(str, mode[0]);
    console.log(chart);

    console.log("Server is ready on http://%s:%s", host, port);
})