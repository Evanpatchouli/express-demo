const { Router } = require('express');
const logger = require('../utils/logger');
const Resp = require('../model/resp');

const router = Router();

router.get('/:key', (req, res, next) => {
  logger.info('Hello World!');
  let key = req.params.key;
  switch (key) {
    case "1": {
      throw new Error(JSON.stringify({
        code: 400,
        msg: "自定义异常1",
        back: true
      }))
    }
    case "2": {
      throw new Error(JSON.stringify({
        code: 500,
        msg: "自定义异常2",
        back: true
      }))
    }
    case "3": {
      throw new Error(JSON.stringify({
        msg: "没指定code分类的自定义异常",
        back: true
      }))
    }
    case "4": {
      throw new Error(JSON.stringify({
        code: 400,
        msg: "不返回的自定义异常",
        back: false
      }))
    }
    case "5": {
      throw new Error("统一返回的通用异常")
    }
    default: break;
  }
  res.json(Resp.ok('Hello World!', 1, null));
});

module.exports = router;
