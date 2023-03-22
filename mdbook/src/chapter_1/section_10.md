# 中间件

中间件，估计大家在前几节里面听的耳朵都要出茧子了吧！一直提到，一直不讲。别急，这不来了嘛

## 准备工作

拷贝第一节Hello World项目

## 什么是中间件

如果正在阅读本书之前的你，已经有过一些其他框架或语言的后端开发经历，那理应是知道中间件这个东西的。当然也不绝对，比如隔壁某个框架太贴心了，以至于笔者都觉得理所应当，在撰写本节时，才惊觉原来在那个框架里竟内置了这么多的中间件。

由于 express.js 是一个轻量级后端框架，因此中间件的身份变得非常的突出。

在 express.js 中，中间件（Middleware）是指应用中，用于**额外**处理 HTTP 请求和响应的函数，通常不涉及主体业务。中间件函数可以访问请求对象（request object）（req）、响应对象（response object）（res）和应用程序中处理请求-响应循环流程的**下一个**中间件函数（next）。
在 express.js 应用中，可以使用 use() 方法来挂载中间件函数。在处理 HTTP 请求时，express.js 会按照添加中间件函数的顺序依次调用它们，直到响应被发送为止。如果在某个中间件函数中没有调用 next() 方法，则**请求-响应**循环流程会在该中间件函数队伍中提前终止。

中间件的应用主要在日志，鉴权，预检，初步数据处理，异常处理等等。接下来，举几个简单的例子:

## 路由中间件

是的，路由可以单独抽离出来的中间件，可以挂载在app也可以作为子路由挂载在其他路由上

```javascript
//Route coule be middleware
const routers = express.Router();

routers.get('/', function (req, res) {
    res.send('Hello World!');
});

routers.post('/', (req,res)=> {
    res.send('Bad World!');
    
})
app.use(routers)
````

## 鉴权中间件

鉴权中间件，可以被挂载到单个路由，一系列路由以及app全局  
这是一个检查请求头token的鉴权中间件:
```javascript
//鉴权中间件，可以被挂载到单个路由，一系列路由以及全局
let auth = (req,res,next) => {
    if (req.headers['token']!='evanp'){
        return res.send('Unauthorized');
    }
    next()
}

const router_root = express.Router();

router_root.post('/root', auth, (req,res)=> {
    res.send('Hello root!')
})
app.use(router_root);
```

## 异常处理中间件

异常处理中间件，全局捕捉异常，防止服务器崩溃
```javascript
//异常中间件
const exhandler = (err,req,res,next)=> {
    return res.json({ "err":{ "name": err.name, "msg": err.message }});
}
app.use(exhandler);

//测试接口
router_err.get('/error', auth, (req,res)=> {
    const err = new Error("error!");
    err.name = "故意err";
    err.message = "error!";
    throw err;
    res.status(200).json({msg: 'good!'});
})
app.use(router_err);
```

## 第三方中间件

当然了，在实际生产中，并不需要每个中间件都我们自己写，一是自己造轮子麻烦，而是自己造的轮子可用性不高，不够专业，三是优秀团队开发的中间件性能更好，隐患更小  
可以更多的使用第三方团队开发的优秀的中间件，比如鉴权相关的passport.js，jsonwebtoken，sql相关的knex，sequelize等等。


## 万物皆可中间件

上面给的几个例子，都是属于一个模块的不同部分作为中间件挂载到当前的应用，在express.js中，中间件远不止于次  

app也可以作为中间件挂载到app!一般是负责不同功能的app聚合到一个总的app上，比如订单模块单独一个app，用户模块单独一个app，一起挂载到作为整个完整系统的app上，这样子把整个系统按不同模块切割成独立的app，更易于维护和管理，有点伪微服务架构的意味。

router也能把app作为他的子中间件，这种做法应该很少用吧，暂时不清楚有什么应用场景。
