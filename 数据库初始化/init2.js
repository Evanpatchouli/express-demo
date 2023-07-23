global.__root = __dirname;

const knex = require('./knex.js')

const promises = knex.runSql(`${__root}/db/schema.sql`);
Promise.all(promises)
    .then(res=>{
        console.log("Database inits successfully!")
    }).catch(err=>{
    console.error(err);
})