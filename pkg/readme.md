1. 安装pgk: `npm install pkg -dev`
2. 在`package.json`中指定`bin`为项目入口文件
3. 在`package.json`中配置pkg打包命令
4. 运行，如果fetch出错，去github上下载对应的包
5. 前缀node改fetch，放到.pkg-cache/v3.x下面
7. 重新打包，即可成功，速度很快，提示很少