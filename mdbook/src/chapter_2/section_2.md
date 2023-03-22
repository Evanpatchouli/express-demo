# MVC层级架构

M-V-C(model-view-control)是非常经典的一种web项目架构，将项目分为模型，视图和控制三大层。

这是我自己搭建的一种mvc架构:

```text
│  app.js
│  package-lock.json
│  package.json
│
├─control
│  ├─routes
│  │      userRoutes.js
│  │
│  └─service
│          userService.js
│
├─model
│      resp.js
│      user.js
│
├─node_modules
│  //...
│
├─static
│      data.json
│
├─utils
│      sqlUtil.js
│      stringUtil.js
├─midwares
│      exhandler.js
│
└─views
        index.html
```

模型：实体类  
视图：页面  
控制：各种控制（逻辑、视图等）

他们各自还可以细分层次：

## model层

所有模块需要的模型都放到这里

model可以按照其用途、服务对象等分成普通对象、数据传输对象、完整对象的散对象、数据表映射对象等等，比如po, dto, vo等等，之前sequelize中的模型就算是数据表映射对象。  
当然这是一个跨语言的概念，由于js天生没有类型系统，很多时候你可以选择不定义某些对象，有更高的灵活性，定义对象，虽然灵活性降低，但更易于代码维护，看实际情况决定，当然，一些高复用性的建议定义好，比如给REST接口统一的返回格式，那你就可以专门设定一个对象:

```js
let resp = {
  code: null,
  msg: null,
  data: null,

  Ok: (msg,data)=>{
    this.code = 200;
    this.msg = msg!=undefined? msg : 'success';
    this.data = data!=undefined? data : null;
  }
}

let respOk = {
  code: 200,
  msg: 'success',
  data: null
}

module.exports = {
  resp: resp,
  respOk: respOk
}
```

## 控制层

所有功能模块的路由，服务等等都放到这里

控制层可以再根据特性分层，比如路由单独搞个routes层，业务处理单独搞个service层等等

## 补充

同样的，实际开发中需要更多的目录，比如工具目录，资源目录等等，放你的图片，放你的工具函数，放你封装好的sql函数，放你的中间件等等


## 下一节-基于业务特性的分布式架构
