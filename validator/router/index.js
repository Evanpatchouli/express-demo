const { Router } = require('express');
const logger = require('../utils/logger');
const validator = require('express-validator');

const router = Router();

router.get('/', (req, res) => {
  logger.info('Hello World!');
  res.send('Hello World!');
});

/**
 * Validator Race checker
 * @param {validator.ValidationChain[]} validChain 
 * @returns 
 */
const ValidRace = (validChain)=>{
  return async (req, res, next) => {
    await Promise.race(validChain.map(validate => validate.run(req)))
    const valires = validator.validationResult(req);
    if (!valires.isEmpty()) {
      console.log(valires.array());
      const err = new Error(valires.array()[0].msg);
      throw err;
    }
    next();
  }
}

router.get('/greet', validator.query('person').notEmpty().trim().escape().withMessage("person不能为空"),(req, res, next) => {
  const valires = validator.validationResult(req);
  if (!valires.isEmpty()) {
    console.log(JSON.stringify(valires));
    const err = new Error(valires.array()[0].msg);
    throw err;
  }
  logger.info(`Hello ${req.query.person}!`);
  res.send(`Hello ${req.query.person}!`);
});

router.get('/greet2',
  ValidRace([
    validator.query('age').trim()
      .notEmpty().withMessage("age不能为空").bail()
      .isInt().withMessage("age必须是正整数").bail().toInt()
  ]),
(req, res, next) => {
  logger.info(`Hello ${req.query.person}!`);
  res.send(`Hello ${req.query.person}!`);
});

module.exports = router;
