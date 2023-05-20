-- 先删除user表
DROP TABLE IF EXISTS `user`;
-- 定义表结构，并创建user表
CREATE TABLE `user` (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,  --自增主键
    name TEXT NOT NULL,
    age INTEGER NOT NULL
);
