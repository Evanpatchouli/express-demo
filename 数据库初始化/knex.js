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

sqlClient.runSql = (path)=>{
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
    const promises = sqls.map(sql=>{
        sql += ';';  // knex会自动补上冒号，加不加无所谓其实
        console.log("Going to run a sql:");
        console.log(sql);
        return sqlClient.raw(sql);
    })
    return promises;
}

module.exports = sqlClient;



