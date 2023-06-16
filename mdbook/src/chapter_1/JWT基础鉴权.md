# JWT基础鉴权

Web安全是Web应用中非常重要的一环，主要由后端和服务器承担安全保障  
面对请求源，后端有着各种各样的鉴权机制: session,cookie,token,jwt,OAuth,OAuth2,api-key,signature...  
本节以jwt为例，演示一个极简的token鉴权

## 准备工作

- 拷贝第一节HelloWorld项目
- 安装一种jwt依赖(本节使用jsonwebtoken)

## 实践

接下来我们使用jsonwebtoken来实现最常见的登录鉴权，登录成功后返回一个token，之后凭借这个token去访问另外的路由

- 首先引入jwt依赖
```js
const jwt = require('jsonwebtoken');
```

- 定义一个密钥

之后我们会利用这个密钥生成token，和检验token
```js
const secret = 'mysecretkey';
```

- 写个登录时生成token的函数

传入用户名和密码，检验密码，正确就生成一个token  
生成token: `jwt.sign(标志,密钥,选项(生命周期等))`
```js
function getToken(user) {
    let token = null;
    const payload = {
      uname: user.uname,
    };
    if (user.uname == 'root' && user.passwd == 'root') {
        token = jwt.sign(payload, secret, { expiresIn: '1h' });
    }
    return token;
}
```

- 写一个访问时检验token的函数

传入req,res,next，从请求头中取出名字为'token'的一个token，若请求头里不带token则返回请求报告没token，token校验通过了则放行
```js
function checkToken(req, res, next) {
    const token = req.headers['token'];
    if (!token) return res.status(401).json({ message: 'No token provided.' });
    jwt.verify(token, secret, (err, decoded) => {
      if (err) return res.status(500).json({ message: 'Failed to authenticate token.' });
      req.userId = decoded.id;
      next();
    });
}  
```

- 编写登录接口
```js
app.post('/login', (req, res) => {
    let user = req.body;
    let token = getToken(user);
    if(token!=null) {
        res.send(token);
    } else {
        res.status(401).send("wrong");
    }    
});
```

- 编写一个需要校验token的接口

将token检验函数作为中间件挂载到 /root 路由上
```js
app.get('/root', checkToken, (req, res) => {
    res.send('hello root user!');
});
```

## 接口测试

尝试用api调试工具先访问 login 接口，利用正确的用户名和密码获取token，然后用得到的token去访问 root 接口

## 下一节-全局错误处理