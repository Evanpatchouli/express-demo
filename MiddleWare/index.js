const bodyParser = require('body-parser');
const express = require('express');
const routers = express.Router();
const evchart = require('js-text-chart').evchart;

//everything could be middleware.

const app = express();
const subapp1 = express.application();

app.all("*", function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Methods", "*");
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

//Route coule be middleware
routers.get('/', function (req, res) {
    res.send('Hello World!');
});

routers.post('/', (req,res)=> {
    res.send('Bad World!');
    
})

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

const router_err = express.Router();

router_err.get('/error', auth, (req,res)=> {
    const err = new Error("error!");
    err.name = "故意err";
    err.message = "error!";
    throw err;
    res.status(200).json({msg: 'good!'});
})

app.set('subdomain offset',2);
const router_sub = express.Router();
router_sub.get('/multi.*.com',(req,res)=>{
    res.json({"sub":req.subdomains});
})

//app.use(auth);    //auth挂载到全局
app.use(router_root);
app.use(router_sub);
app.use(routers);
app.use(router_err);

//异常中间件
const exhandler = (err,req,res,next)=> {
    return res.json({ "err":{ "name": err.name, "msg": err.message }});
}
app.use(exhandler);

const server = app.listen(8080, () => {
    let host = server.address().address;
    let port = server.address().port;

    let str = "EXPRESS-DEMO";
    let mode = [ "close", "far", undefined ];
    let chart = evchart.convert(str, mode[0]);
    console.log(chart);

    console.log("Server is ready on http://%s:%s", host, port);
})