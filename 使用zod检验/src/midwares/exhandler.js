const Resp = require('../model/resp');
const logger = require('../utils/logger');

module.exports = {
  /**
   * @type {import('express').ErrorRequestHandler}
   */
  excatcher: (err, req, res, next) => {
    if (err) {
      const {code,msg,symbol,data,back} = err.message;
      if (back != false) {
        if (code) {
          if (code == 400) {
            res.json(Resp.fail(msg, symbol??-1, data??null));
          }
          if (code == 500) {
            res.json(Resp.bad(msg, symbol??0, data??null));
          }
        } else {
          res.json(Resp.bad(err.message));
        }
      }
      next(err);
    } else {
      next();
    }
  },

  /**
   * @type {import('express').ErrorRequestHandler}
   */
  exlogger: (err,req,res,next)=>{
    if (logger.level.level <= 10000) {
      logger.error(err);
      return;
    }
    logger.error(err.message);
  }
}
