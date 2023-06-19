# express-validator

express.js 集成 express-validator进行数据校验

在最初的时候，对于请求的数据校验，我们是自定义一个中间件，然后在里面通过最原生的方式检验。在本节，我们将尝试用一种更优雅的方式进行数据校验。

## 准备工作

创建一个基础的 express 项目（本文基于evp-express-cli），并支持全局同步和异步错误错误处理。

**安装express-validator，并引入:**
```console
npm i express-validator
```
```js
const validator = require('express-validator');
````

## 验证链

validator:
- body()
- cookie()
- header()
- param()
- query()

以`validator.query`为例，我们可以检查query参数中的某一项
```js
router.get('/greet', 
	validator.query('person').trim().notEmpty().escape().withMessage("person不能为空"),
(req, res, next) => {
  const valires = validator.validationResult(req);
  if (!valires.isEmpty()) {
    const err = new Error(valires.array()[0].msg);
    throw err;
  }
  logger.info(`Hello ${req.query.person}!`);
  res.send(`Hello ${req.query.person}!`);
});
```
validationResult()用法获取校验结果，valires是校验结果，主要结构如下：
```ts
{
  //...
	errors: []
}
```
errors需要通过valires.array()来得到，当然序列反序列化也行
每一项error结构如下：
```ts
{
	"type": string,
	"msg": string,
	"path": string, //如上面检查的person
	"location": string //如query,body..
}
```

如果需要检验多个参数，就放进数组即可：
```js
[
  validator.query('person').trim().notEmpty().escape().withMessage("person不能为空"),
  validator.query('address').trim().notEmpty().escape().withMessage("address不能为空")
]
````

## 封装剥离

之前的写法，是把错误处理和定义都直接写在路由上，臃肿且代码侵入性较强，我们可以进一步封装：

**Checker:**  
这个示例采取了检验并发竞赛的机制，你也可以使用其它的并发或者同步机制:
```js
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
```
然后在路由上使用即可:
```js
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
```
bail()的用处是，如果前面出错就终止检验链，不加的话，age空了还会往后面检验是不是整数。

当然你也可以赋给一个变量，然后再引进来:
```js
const CheckGreet2 = ValidRace([
  validator.query('age').trim()
    .notEmpty().withMessage("age不能为空").bail()
    .isInt().withMessage("age必须是正整数").bail().toInt()
]);
router.get('/greet2', CheckGreet2, (req, res, next) => {
  logger.info(`Hello ${req.query.person}!`);
  res.send(`Hello ${req.query.person}!`);
});
```

---

express-validator的用法远远不止于此，详见官方文档<https://express-validator.github.io/docs>

---

## 下一节-集成Redis
