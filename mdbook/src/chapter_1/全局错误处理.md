# 全局错误处理

在前面几节里，我们处理异常的方法都是手动在可能引发异常的地方捕捉错误，这固然是必要的，可以有针对性得处理异常，但很多时候，有许多潜在的异常，有一句话叫永远不要相信输入的数据，你永远都不知道什么时候可能会以什么方式触发某些阴间异常从而造成系统崩溃。因此，我们需要有一位好帮手能帮助我们捕获各种错误  

而这位好帮手就是，**异常处理中间件**

## 自定义异常处理中间件

### 同步异常

异常处理中间件需要传入4个参数: err,req,res和next，这样才会被express识别为异常处理中间件  
创建一个exhandler，并挂载到服务器上:  
注意: 挂载异常处理中间件的行为必须位于所有定义的接口之下，至于理由，会在下一节《中间件》中给出解答
```js
let exhandler = (err, req, res, next)=> {
    console.error('Error:', err);
    res.status(500).json(err);
}
app.use(exhandler);
```

我们在helloWorld接口中人为抛出一个异常试一下，可以直接throw，也可以传递给next（事实上，意外的异常发生时，会被express捕获并传递给next，然后再丢给我们的异常处理中间件）
```
app.get('/', (req, res, next)=> {
    const err = new Error();
    err.status = 500;
    err.message = '对不起，网站正在维护中';
    throw err;
    //next(err);
    // res.send('Hello World!');
});
```

### 测试

使用api调试工具GET 127.0.0.1:8080/，我们的程序不会崩溃，并且你将得到被封装好的错误信息，并且响应码是500。

```JSON
{
    "name": "无法访问",
    "message": "对不起，网站正在维护中"
}
```

### 异步异常

上面的异常是产生在串行的代码中的，那如果在异步操作中产生了异常呢？  
我们弄一个异步异常的接口试一下:  
```js
app.post('/', (req, res, next)=> {
    setTimeout(()=>{
        const err = new Error();
        err.name = '无法访问';
        err.message = '对不起，网站真的正在维护中！';
        next(err);
    },3000);
});
```
POST 127.0.0.1:8080/，你花费了3秒时间得到我们的维护信息！  
不过上面这个接口之所以能返回维护信息，是因为在同步流中，没有进行响应操作，那前端只要不超过设置的超时时间，就会一直等待，然后3秒后等来了我们的错误信息

我们在同步流内先进行响应，假如我们并不在乎异步操作的结果就可以响应了:
```js
app.post('/', (req, res, next)=> {
    setTimeout(()=>{
        const err = new Error();
        err.name = '无法访问';
        err.message = '对不起，网站真的正在维护中！';
        next(err);
    },3000);
    res.send("Bad World!");
});
```
POST 127.0.0.1:8080/，这次你得到了Bad World!，因此只有当你的异常进入了未结束的同步流（用async/await语法糖，或者Promise回调等），才能被返回给请求源

## 下一节-中间件
