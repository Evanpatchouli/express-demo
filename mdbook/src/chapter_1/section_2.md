# 请求类型

本节将介绍常见的http请求方式，并站在后端的角度初步感受它们的不同点

## 各类Http请求

- **GET**  
意图是**获取**，不会对服务器上的数据产生影响，将要携带的数据放在**URL**上，通常不带请求体，带了也不一定兼容
- **POST**  
意图是**提交**，通常用于修改和新增服务器上的数据，偏向**新增**，路径定位较模糊，要携带的数据通常放在**请求体**内
- **PUT**  
类似POST，偏向**更新**，路径定位更明确，要携带的数据通常放在**请求体**内  
★ **幂等性**：连续PUT请求后，效果应当只有一次，而POST则会创建多个新资源，不过在REST风格下以及在后台有严格的检验情况下其实这些区别可以忽略  
★ **缓存机制**：由于PUT的幂等性，不存在缓存，而POST是缓存的，比如你在表单里用POST，不设置提交后清除，刷新页面它会将之前的数据再提交一遍
- **DELETE**  
意图是删除，从服务器上删除某些数据
- **HEAD**  
类似GET，但争对它的响应没有body，只有响应头，常用于判断资源是否存在、链接有效性等
- **OPTIONS**  
意图是询问当前URL允许的请求方法等，常用于跨域请求前的预检和获取服务器的安全控制信息等
- **TRACE**  
路径追踪，回显请求，常用于测试阶段
- **PATCH**  
PUT的超类，指定资源的局部更新
- **COPY**  
请求将页面拷贝到另一个URL，常用于Web资源的备份
- **MOVE**  
请求将页面移动到另一个URL，常用于Web资源的搬迁
- **LINK**  
请求与服务器建立链接
- **UNLINK**  
断开与服务器的链接

其中 GET, POST 最为广泛使用，同时可以使用PUT和DELETE让我们的接口的目的更具有指向性  
本书绝大部分接口都将采用类REST风格，即普遍的返回码200，数据格式为json

## express处理不同的请求

由于实际受不同的开发规范和业务环境影响，在这里只以GET和POST举例

### get请求
```js
//省略了express项目的创建
class Item {
    constructor(name, value) {
      this.name = name;
      this.value = value;
    }
}

//get接口
app.get('/request', function (req, res) {
    let result = [];
    result.push(new Item("baseUrl",req.baseUrl));
    result.push(new Item("fresh",req.fresh));   //请求是否存活
    result.push(new Item("hostname",req.hostname)); //请求源域名
    result.push(new Item("ip",req.ip)); //请求源IP
    result.push(new Item("originalUrl",req.originalUrl));
    result.push(new Item("params",req.path));   //路径参数: /x/y/z/
    result.push(new Item("protocol",req.protocol)); //请求协议
    result.push(new Item("query",req.query));   //查询参数
    result.push(new Item("route",req.route));   //请求路由
    result.push(new Item("is:Content-Type",req.is('application/json')));

    res.send(result);
});
```
以上代码，定义了GET接口，并返回了关于请求的大部分信息

### 测试接口
使用api调试工具，尝试用不同的携带数据方法以get形式访问该接口，比较不同的返回结果

### post请求
监听相同路径的post请求，开启json解析，一会我们调试时请求体采用最常用的json格式
```js
//启用json解析
app.use(express.json({type: 'application/json'}));

app.post('/post', function (req, res) {
    let result = [];
    result.push(new Item("baseUrl",req.baseUrl));
    result.push(new Item("fresh",req.fresh));
    result.push(new Item("hostname",req.hostname));
    result.push(new Item("ip",req.ip));
    result.push(new Item("originalUrl",req.originalUrl));
    result.push(new Item("params",req.path));
    result.push(new Item("protocol",req.protocol));
    result.push(new Item("query",req.query));
    result.push(new Item("body",req.body));
    result.push(new Item("route",req.route));
    result.push(new Item("is:Content-Type",req.is('application/json')));

    res.send(result);
});
```

### 测试接口
使用api调试工具，尝试用不同的携带数据方法以post形式访问该接口，比较不同的返回结果

## 下一章-处理请求数据