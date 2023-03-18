const express = require('express');
const evchart = require('js-text-chart').evchart;
const jwt = require('jsonwebtoken');
const secret = 'mysecretkey';

const app = express();
app.use(express.json({type: 'application/json'}));

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

function checkToken(req, res, next) {
    const token = req.headers['token'];
    if (!token) return res.status(401).json({ message: 'No token provided.' });
    jwt.verify(token, secret, function(err, decoded) {
      if (err) return res.status(500).json({ message: 'Failed to authenticate token.' });
      req.userId = decoded.id;
      next();
    });
}  

app.all("*", function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Methods", "*");
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.post('/login', function (req, res) {
    let user = req.body;
    let token = getToken(user);
    if(token!=null) {
        res.send(token);
    } else {
        res.status(401).send("wrong");
    }
    
});

app.get('/root', checkToken,function (req, res) {
    res.send('hello root user!');
});


const server = app.listen(8080, () => {
    let host = server.address().address;
    let port = server.address().port;

    let str = "EXPRESS-DEMO";
    let mode = [ "close", "far", undefined ];
    let chart = evchart.convert(str, mode[0]);
    console.log(chart);

    console.log("Server is ready on http://%s:%s", host, port);
})