global.__root = __dirname;

const { User } = require('./sequelize');

// User.drop();User.sync();
User.sync({ force: true })  //这个相当于前两个的结合体
    .then(res=>{
        console.log('Database inits successfully!');
    }).catch(err=>{
    console.error(err);
})