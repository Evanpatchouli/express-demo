# 使用zod检验

上一节我们介绍了 express-validator，本节我们介绍一个更通用的检验工具 **Zod**

## What's Zod.js?

写前端的同学可能知道Zod，我们在提交表单前需要对数据初步检查，Zod是一个很棒的工具。前端可以偷懒，但后端不能偷懒，Zod也可以用到我们的 express 后端中来，封装一个 Zod 中间件即可

## 准备工作

用 evp-express-cli 创建一个最简洁的新项目。

## 了解Zod工作流程

1. 定义待检验的数据格式
```js
const { z } = requie("zod");

const schema = z.object({
  username: z.string().nonempty("username cannot be empty")
})
```
这个 schema 就是 Zod 检验一个对象或者变量的**检验器**，如果检验目标只是一个值，`z.string()`之类的即可
2. 检验器验证传入
把待检查的数据传递给检验器，有4种：`schema.parse(data)`, `schema.parseSync(data)`, `schema.safeParse(data)`, `schema.safeParseSync(data)`，parse会直接抛出错误信息，而safeParse返回一个对象，包含了验证是否成功和错误信息，结构如是：`{success: boolean, message: ZodError}`
3. 错误处理
对于检验器发现的错误你需要自行处理

## 安装Zod

```shell
npm install zod
```

## 封装中间件

在 midwares 目录下创建 zod.js：  
导出了一个 ZodValid函数：该函数传入一个对象，包含了 headers, params, query 和 body 四个可选属性，分别对应请求可以传入数据的四个部分，如果需要检验，就传入定义好的检验器给需要检验的部分；ZodValid会返回一个 request handler，在处理器里面根据传入的检验器分别去进行检验，这个**处理器才是最后的中间件**，ZodValid其实是一个**中间件工厂**。我在这里取出了第一个错误，并将错误的 message 抛出，evp-express 默认直接捕捉并返回错误信息，我这样写是为了让读者对错误信息能看的更清楚，非特定场景下，不一定要返回这样细致的错误信息，**可以抛出统一错误信息**。
```js
const { z } = require("zod");

/**
 * @typedef {{
 * code: string;
 * expected: string;
 * received: any;
 * path: string[];
 * message: string;
 * }} MyZodError
 */

/**
 * @param {z.ZodError} errors 
 * @reutrns
 */
function selFirstError(errors) {
  /**
   * @type {MyZodError[]}
   */
  const errs = JSON.parse(errors);
  return errs[0];
}

module.exports = {
  /**
   * 
   * @param {{
   * headers: z.ZodObject|undefined;
   * params: z.ZodObject|undefined;
   * query: z.ZodObject|undefined;
   * body: z.ZodObject|undefined;
   * }} param0 
   * @returns
   */
  ZodValid: ({headers, params, query, body})=>{
    /**
     * @type {import("express").RequestHandler}
     */
    const handler = (req,res,next)=>{
      if (headers) {
        const result = headers.safeParse(req.headers);
        if (!result.success) {
          throw new Error(selFirstError(result.error).message)
        }
      }
      if (params) {
        const result = params.safeParse(req.params);
        if (!result.success) {
          throw new Error(selFirstError(result.error).message)
        }
      }
      if (query) {
        const result = query.safeParse(req.query);
        if (!result.success) {
          throw new Error(selFirstError(result.error).message)
        }
      }
      if (body) {
        console.log(req.body);
        const result = body.safeParse(req.body);
        if (!result.success) {
          throw new Error(selFirstError(result.error).message)
        }
      }
      next();
    }
    return handler;
  }
}
```

## 使用中间件

改写 router/index.js：定义2个路由，一个 GET 一个 POST，GET接口检验 query 参数种的 name 字段，POST接口检验请求体数据中的 name, pass 和 email，由于请求发送的数据格式使用了 Json，所以我们的ZodValid要放在转换请求体格式的Json中间件之后。
```js
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
```

## 测试

调整请求数据，分别访问这两个接口，你将得到类似这样的结果：
```json
{
  "code": 500,
  "msg": "name cannot be empty",
  "data": null,
  "symbol": 0,
  "type": "Bad Request"
}
```
```json
{
    "code": 500,
    "msg": "email is invalid",
    "data": null,
    "symbol": 0,
    "type": "Bad Request"
}
```

---

本文仅演示了 Zod.js 最基础的用法，还有`z.optional`可选，`z.nullish`可空，`z.refine`自定义逻辑等api，更详细更高阶的用法可以查看 **Zod官方手册**：<https://zod.dev/README_ZH>

## 下一节-集成Redis

