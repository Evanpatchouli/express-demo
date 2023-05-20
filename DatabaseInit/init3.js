global.__root = __dirname;

const { sqlz } = require('./sequelize.js')

const promise = sqlz.runSql(`${__root}/db/schema.sql`);
Promise.all([promise])
    .then(res=>{
        console.log("Database inits successfully!")
    }).catch(err=>{
    console.error(err);
})