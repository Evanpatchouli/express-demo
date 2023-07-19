const { Router } = require('express');
const logger = require('../utils/logger');
const Resp = require('../model/resp');
const { ZodValid } = require('../midwares/zod');
const { z } = require('zod');
const { Json } = require('../midwares/bodyParser');

const router = Router();

router.get('/', ZodValid({
  query: z.object({ name: z.string().nonempty("name cannot be empty") })
}), async (req, res, next) => {
  const name = req.query.name;
  logger.info(`Hello World! ${name}`);
  res.json(Resp.ok(`Hello World! ${name}`, 1, null));
});

router.post('/', Json, ZodValid({
  body: z.object({ 
    name: z.string().nonempty("name cannot be empty").min(8, "name at least 8 length"),
    pass: z.string().nonempty("password cannot be empty").min(8, "password at least 8 lenght"),
    email: z.string().email("email is invalid") })
}), async (req, res, next) => {
  const name = req.body.name;
  logger.info(`Hello World! ${name}`);
  res.json(Resp.ok(`Hello World! ${name}`, 1, null));
});

module.exports = router;
