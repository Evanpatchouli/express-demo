# Docker部署

本节我们来介绍如何使用 **Docker** 部署 express 应用

## 准备工作

- linux 系统
- 安装好 Docker
- 一个基础的 evp-express-cli 项目，选上 pkg 工具包
- Docker 的详细用法本文不做介绍，请先自行查阅了解

## 在 Docker 中部署源码

一个很简单的部署方法就是，拉取一个 node 基础镜像，直接在里面运行 express 项目：
以下是 `.dockerignore` 示例：
```text
node_modules
dist
```
以下是响应的 Dockerfile 示例：
```dockerfile
# Build environment
FROM node:16
ENV NODE_ENV=production

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 8080
CMD ["node src/index.js"]
```
基本流程就是：
1. 拉取node镜像 
2. 指定工作目录 
3. 拷贝项目源码及资源文件 
4. 安装依赖 
5. 暴露端口 
6. 设置启动命令

## 在 Docker 中构建部署

上面采取的是直接部署源代码，当然也可以先对源码进行构建再部署。这里又可以分为两种，一种仍然需要 node 运行时，仅仅借助 rollup 之类的工具将源码打包为单个 `.js` 文件，然后部署时只需拷贝这单个文件即可，具体过程无需再做介绍

另一种是脱离 node 运行时，使用 pkg 构建 express 项目，最终部署构建产物到纯净的 linux 镜像即可。如果你在进行 docker 部署前，事先构建好再部署，那具体做法也不需介绍，本文介绍的是在 docker 中阶段的从零构建到部署的过程：

**编写 Dockerfile**: 
1. 拉取合适的 node 镜像作为构建环境，`builder` 是构建镜像别名，可以随便取（后面有用）：
```dockerfile
# Build environment
FROM node:16 AS builder
ENV NODE_ENV=production
```
2. 拷贝依赖配置文件（`package.json`和`package-lock.json*`）到**指定目录**（后面有用）
```dockerfile
WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]
```
3. 安装依赖包
```dockerfile
RUN npm install
```
4. 拷贝源码以其它要一并被打包进可执行程序的文件
```dockerfile
ADD src src
ADD assets assets
```
5. 构建适用于linux的可执行程序，示例的产物名为 `DockerDeploy`（后面有用）
```dockerfile
RUN npm run build:linux
```
6. 拉取一个 linux 镜像作为运行环境，示例选用了 debian，具体能用哪个还要视项目而定
```dockerfile
# lightly runtime environment
FROM debian
```
7. 设置时区，如果需要的话
```dockerfile
RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
RUN echo 'Asia/Shanghai' >/etc/timezone
```
8. 从**构建镜像**将中构建好的**可执行程序**拷贝到到**运行镜像**下的指定目录
语法：`COPY --from=构建镜像别名 可执行程序路径 指定目录路径`
```dockerfile
COPY --from=builder /app/dist/DockerDeploy /app/
```
9. 拷贝外部的资源文件和文件夹（如果有的话），示例没有，略过，如有，用 `ADD` 或 `COPY` 即可
10. 暴露端口，并在指定目录下运行可执行程序
```dockerfile
WORKDIR /app

EXPOSE 8080
CMD ["./starfolder-service"]
```
以下是完整的 Dockerfile 示例：
```dockerfile
# Build environment
FROM node:16 AS builder
ENV NODE_ENV=production

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install

ADD src src

RUN npm run build:linux

# lightly runtime environment
FROM debian

RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
RUN echo 'Asia/Shanghai' >/etc/timezone

COPY --from=builder /app/dist/starfolder-service /app/

WORKDIR /app

EXPOSE 8080
CMD ["./DockerDeploy"]
```
这样的分阶段构建过程，可以尽可能得减小最终的镜像体积

---

## 下一节-pm2进程管理