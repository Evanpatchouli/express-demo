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

module.exports = {
    sqlz: sqlClient,
    User
}

