const express = require('express');
const index = require('./router/index.js');
const {excatcher,exlogger} = require('./midwares/exhandler');
const path = require('path');

const app = express();

app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');

app.use(index);

app.use('/static', express.static(path.join(__dirname, '../public')));
// app.use('/views', express.static(path.join(__dirname, '../views')));

app.get('/views', (req,res)=> {
  res.render('index', { title: 'express-pug-demo', message: 'Welcome to express pug!'});
})

app.use(excatcher);

app.use(exlogger);

module.exports = app;

