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