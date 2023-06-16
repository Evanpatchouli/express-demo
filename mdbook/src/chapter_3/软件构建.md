# 软件构建

运行node项目，一般都是直接运行源码，不过这样子部署的时候不太方便，需要拷贝整个文件夹，如果是需要交付给客户的，并且客户不需要源码，客户不懂编程知识的话，你丢给他一堆源码让该怎么让他运行呢？Java可以打包成 jar/war, C/C++可以打包为 exe，Node也迫切需要一种可靠的构建技术。前端的朋友们可能都熟悉webpack,rolliup或者是Vite，不过它们都只是将项目合并为单个js文件，运行仍旧依赖外部的js-runtime，在本节，我们将介绍一个构建Node项目为可执行程序的工具 —— **pkg**

## 准备工作

创建如下项目目录：
```TEXT
│  package.json
│  readme.md
│
├─assets
│      config.yaml
│
├─db
│      data.db
├─src
│      index.js
│
├─dist
│
└─node_modules
```
assets目录放的是静态资源，比如配置，图片，脚本什么的，我这里放一个yaml配置文件:  
```yaml
app:
  name: pkg-demo
  version: 0.0.1
server:
  host: 127.0.0.1
  port: 8080
```
db目录则放置我们的sqlite数据库文件  
以下是index.js的内容：  
做了3件事情，连接到sqlite数据库，提供返回config.yaml内容的接口和下载数据库文件的接口
```js
const express = require('express');
const evchart = require('js-text-chart').evchart;
const app = express();
const path = require('path');
const yaml = require('js-yaml');
const fs = require('fs');
const config = yaml.load(fs.readFileSync('../assets/config.yaml'));

const dbpath = '../db/data.db';
const knex = require('knex');
const sqlite = knex({
    client: 'sqlite3',
    connection: {
      filename: dbpath,
      acquireConnectionTimeout: 1000
    },
});

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

app.get('/config', function (req, res) {
    res.json(config);
});

app.get('/db', function (req, res) {
    res.download(dbpath);
});

const server = app.listen(config.server.port, config.server.host, () => {
    let host = server.address().address;
    let port = server.address().port;

    let str = config.app.name;
    let mode = [ "close", "far", undefined ];
    let chart = evchart.convert(str, mode[0]);
    console.log(chart);

    console.log("Server is ready on http://%s:%s", host, port);
})
```
此时我们访问这些接口都是可以正常用的：
```console
C:\Users\GrapeX>curl -X GET http://127.0.0.1:8080
Hello World!
C:\Users\GrapeX>curl -X GET http://127.0.0.1:8080/config
{"app":{"name":"pkg-demo","version":"0.0.1"},"server":{"host":"127.0.0.1","port":8080}}
```
接下来，我们就来实现把这个小项目构建为一个可以直接运行的exe程序，并且assets内置其中，db则还是在外边，方便我们管理数据库

## 安装并配置pkg

安装pkg: `npm i pkg -dev`

大致说一下pkg是怎么进行构建的：首先指定项目的入口js文件，然后pkg会根据代码中的依赖关系，顺藤摸瓜的把所有相关的js文件都找到，然后根据指定的node版本和编译平台环境(win,linux,macos)开始编译你写的js文件和项目安装的依赖模块，最终构建exe程序

pkg构建命令的结构：`pkg 入口文件 [options]`

可以通过 `pkg --help` 查看命令选项：
```console
 Options:

    -h, --help           output usage information
                            输出使用帮助信息
    -v, --version        output pkg version
                            输出 pkg 版本信息
    -t, --targets        comma-separated list of targets (see examples)
                            以逗号分隔的目标列表（参考示例）
    -c, --config         package.json or any json file with top-level config  
                            package.json 或者任何 json 文件顶层配置
    --options            bake v8 options into executable to run with them on
                            将 v8 选项打包到可执行文件中，以便它们一起运行
    -o, --output         output file name or template for several files
                            输出文件名或者多个文件的输出模板，默认为npm-package-name
    --out-path           path to save output one or more executables
                            保存输出可执行文件的路径
    -d, --debug          show more information during packaging process [off]
                            在打包过程中展示更多信息，默认关闭
    -b, --build          don't download prebuilt base binaries, build them
                            不下载预构建的基础二进制文件，而是构建它们
    --public             speed up and disclose the sources of top-level project
                            加速和公开顶级项目的源代码
    --public-packages    force specified packages to be considered public
                            强制指定包被认定为公开的
    --no-bytecode        skip bytecode generation and include source files as plain js
                            跳过字节码生成阶段，直接打包源文件为普通 js
    --no-native-build    skip native addons build
                            跳过原生插件构建
    --no-dict            comma-separated list of packages names to ignore dictionaries. Use --no-dict * to disable all dictionaries
                            以逗号分隔的包名列表忽略字典，使用 --no-dict * 禁用所有字典
    -C, --compress       [default=None] compression algorithm = Brotli or GZip
                            压缩算法 Brotli 或者 GZip. 默认关闭
```

最核心的几个选项是：
- `-t`：必须要指明编译的依据，否则将会是默认的，比如`v16.16.0-linux-x64`
- `--out-path`：通常我们都会将构建产物生成在指定的目录下
- `-o`：不填将默认为package.json中的name或入口文件名，往往我们可能希望是其它的名字

要注意的是 -o 和 --out-path 不能同时设置，只能设置其中一个

## 打包

对我们的项目进行基础的打包，指定入口为index.js，node版本为16，平台为64位Windows，输出路径在dist目录：
```console
pkg index.js node16-win-x64 --out-path=dist/
```
或者在 package.json中添加 bin 选项：
```json
{
	"bin": "index.js"
}
```
然后使用`.`替代，pkg此时会去读取package.json中的bin：
```console
pkg index.js node16-win-x64 --out-path=dist/
```

运行这条命令，你会看到pkg在拉取(fetch) node16-win-x64，不出意外的话，你半天都拉不下下来，因为它们的服务器在境外  
我们可以到 [Github](https://github.com): <https://github.com/vercel/pkg-fetch/releases> 上去手动下载对应的fetch包，注意版本要和你使用的 pkg 版本契合，我当前的 pkg 版本是3.4，所以我选取了 v3.4 中的 `node-v16.16.0-win-x64`，下载到本地后，进入 `C:\Users\{你用户}\.pkg-cache\你版本\`目录，拷贝下载好的文件到这里，并把`node`改成`fetched`，这样pkg下构建时就会使用事先下载好的node源了

构建好了，我们双击运行`index.exe`一下，很好，直接闪退，我们打命令`index.exe > log.txt` 看看：
```console
node:internal/fs/utils:345
    throw err;
    ^

Error: ENOENT: no such file or directory, open './assets/config.yaml'
    at Object.openSync (node:fs:585:3)
    at Object.openSync (pkg/prelude/bootstrap.js:793:32)
    at Object.readFileSync (node:fs:453:35)
    at Object.readFileSync (pkg/prelude/bootstrap.js:1079:36)
    at Object.<anonymous> (C:\snapshot\pkg\index.js)
    at Module._compile (pkg/prelude/bootstrap.js:1926:22)
    at Object.Module._extensions..js (node:internal/modules/cjs/loader:1159:10)
    at Module.load (node:internal/modules/cjs/loader:981:32)
    at Function.Module._load (node:internal/modules/cjs/loader:822:12)
    at Function.runMain (pkg/prelude/bootstrap.js:1979:12) {
  errno: -4058,
  syscall: 'open',
  code: 'ENOENT',
  path: './assets/config.yaml'
}
```
报错是找不到对应的文件或目录，它找不到我们的config,yaml，此时我们把assets目录复制到dist下，可以正常运行，相同的，db也要复制过来，才能正常下载data.db文件。但这并不是我们想要的，因为我们想要的是配置文件内置在exe程序中，因为往往会包含一些敏感信息。

### 配置内置资源目录

当我们需要将静态资源，比如配置文件(.yaml,.json等)或者其它的非.js文件，需要事先设置资源，pkg才会把指定的资源打包进exe中  
配置方法是在 package.json 中配置 pkg:assets 选项：
```json
  "pkg": {
    "assets": [
      "assets**/*"
    ]
  },
```
assets接收一个数组，每个元素是你指定的资源路径，可以使用通配，上面这个就是把assets下所有文件都指定为资源文件  
官方文档给了这么个示例：
```json
  "pkg": {
    "scripts": "build/**/*.js",
    "assets": "views/**/*",
    "targets": [ "node14-linux-arm64" ],
    "outputPath": "dist"
  }
```
scripts是指那些额外编译后的js，比如你用了大量高级esm语法的代码，被你用babel编译成的普通js，比如你用了v8的然后被编译好的js等等

配置好后再运行，此时还是不行，哪一步出问题了？原因在于我们的路径是这么写的，这种形式会以读取外部文件的方式去寻找：
```js
fs.readFileSync('../assets/config.yaml');
```
而pkg构建的exe是一个快照程序，运行时将处于系统快照内，你可以看到index.js实际运行于C:\snapshot\pkg\index.js，所以对于项目内的资源路径，必须基于快照，快照路径可以用`__dirname`获取
```js
const config = yaml.load(fs.readFileSync(`${__dirname}/assets/config.yaml`));
```
如果采取使用path模块规范化路径，甚至可以不配置package.json，因为pkg检测到`path`+`__dirname`时会自动把对应路径当成资源对待：  
path.join
```js
    fs.readFileSync(
        path.join(
            __dirname,
            '../assets/config.yaml')
        )
```
path.resolve也行
```js
    fs.readFileSync(
        path.resolve(
            __dirname,
            '../assets/config.yaml')
        )
```

到这里，exe完美的如期运行！

### 正确的读取外部路径

但是呢，我们的代码依旧存在小小的瑕疵，就是我们的数据库路径：
```js
const dbpath = '../db/data.db';
```
开发的时候是在根目录下，但部署的时候？打包完后，外部的文件路径可都是相对于exe来说的，也就是说db要放到部署目录的上级目录了，这不符合常理。所以在配置外部文件路径时，我们应当基于根目录去写。怎么获取根目录？index.js中读取`__dirname`？在pkg中行不通的，因为`__dirname`已经成为项目内的虚拟路径了

正确的做法是 `process.cwd()`，这个命令可以直接获取到项目根目录路径(入口文件路径)：
```js
const dbpath = `${process.cwd()}/db/data.db`;
```
或者用path规范化路径：
```js
const dbpath = path.join(process.cwd(), './db/data.db');
```

## 压缩

在构建的时候还可以指定`--compress`参数，来减小构建产物的体积，如：
```js
pkg . -t node16-win-x64 --compress GZip --out-path=dist/
```
本节的示例项目exe由原先的46MB缩小到了40MB，压缩效果还行，不过毕竟压缩了，多多总会对程序的性能造成一点影响，如果你的项目有较高的性能需求，请慎重考虑是否压缩

## 其它

关于`--no-bytecode`参数，开启的话，构建的时候pkg不会将js转为二进制，而是直接以js打包进exe内，体积会小一点，不过js源码的运行效率自然会比二进制程序要逊色一点。  

### es6+
此外，如果你使用了一些es6+的模块，如axios，pkg构建时会报错，`--no-bytecode`参数可以逃避构建时的报错，但这是治标不治本，运行照样跑不通。

我的建议是，使用这些依赖预编译好的普通js版本(axios的package.json似乎写的有点问题，可以手动把代码拷出来用)，如果没有你就手动用babel编译，或者直接使用它们的老的普通js的版本，如 axios 0.27.2 及以前的。
### 以Axios为例

现在新增一个`/toConfig`接口，该接口用axios请求之前的`/config`接口并返回响应结果：
```js
const axios = require('axios').default; //pkg打包失败

app.get('/toConfig', function (req, res) {
    axios.get(`http://${config.server.host}:${config.server.port}/config`)
    .then(function (resp) {
        res.json(resp.data);
    })
});
```
直接用 pkg 构建会出错，因为 pkg 基于 CommonJs 模块，而新版的 axios 默认导出的是 ESModule

- **方案1**：拷贝axios.cjs

拷贝`node_modules\axios\dist\node\axios.cjs`放到自己的源码下并引用：
```js
const axios = require("./axios.cjs").default; // 方案1
```
此时，把原先的axios依赖删了都行，pkg构建的时候还不会WARN

- **方案2**：把axios.cjs作为资源脚本
```js
const axioscjs = path.join(__dirname,"../node_modules/axios/dist/node/axios.cjs");
const axios = require(axioscjs).default;  // 方案2
````

pkg构建的虽然会WARN，但能正常运行即可

- **方案3**：使用低版本的 axios
```console
npm uninstall axios && npm i axios@0.27.2
```
版本低了，比较旧，可能存在不少潜在的问题，不太推荐使用