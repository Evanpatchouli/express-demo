const express = require('express');
const index = require('./router/index.js');
const {excatcher,exlogger} = require('./midwares/exhandler');
const session = require('express-session');
const passport = require('passport');
const config = require('./config.js').get();
const LocalStrategy = require('passport-local').Strategy;

const app = express();

app.use('/views', express.static(config.public, { extensions: ['html'] }));

app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(
  function verify(username, password, done) {
    if (username == 'root' && password == 'root') {
      return done(null, { username, password});
    }
    return done(null, false, {message: "None"});
  }
))

passport.serializeUser((user, cb) =>{
  process.nextTick(()=>{
    cb(null, {username: user.username, password: user.password})
  })
})

passport.deserializeUser((user, cb) => {
  process.nextTick(()=>{
    return cb(null, user);
  });
});

app.use('/', index);

app.use(excatcher);

app.use(exlogger);

module.exports = app;

