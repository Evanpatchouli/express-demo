const { Router } = require('express');
const logger = require('../utils/logger');
const Resp = require('../model/resp');
const { Json, Form, Multi, FromPlus } = require('../midwares/bodyParser');
const passport = require('passport');

const router = Router();

function isLogined(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/views/');
}

router.get('/', isLogined, (req, res, next) => {
  logger.info('Hello World!');
  res.json(Resp.ok('Hello World!', 1, null));
});

router.post('/login', FromPlus, passport.authenticate('local', {
  failureRedirect: '/views/fail',
  failureFlash: false
}), (req, res, next) => {
  res.redirect('/views/home');
});

module.exports = router;
