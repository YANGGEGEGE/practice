// CommonJS 的导入方式 (require)

// 导入整个模块
const mathModule = require('./commonjs-module');
console.log('CommonJS模块名称:', mathModule.name);
console.log('乘法结果:', mathModule.multiply(5, 3));
console.log('加法结果:', mathModule.sum(5, 3));

// 使用解构赋值
const { divide } = require('./commonjs-module');
console.log('除法结果:', divide(10, 2));

// 动态导入
const modulePath = './commonjs-module';
const dynamicModule = require(modulePath);
console.log('动态导入结果:', dynamicModule.name);

// require 特点:
// 1. 同步加载 - 阻塞代码执行直到模块加载完成
// 2. 可以在条件语句中使用
// 3. 可以动态计算模块路径
// 4. 导入的是模块的副本，对导入对象的修改不会影响原模块
// 5. 循环依赖时采用缓存机制处理 