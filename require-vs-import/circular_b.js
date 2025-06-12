console.log('circular_b.js: 文件开始执行');
exports.loaded_b = true;
exports.message_b = '消息来自 b.js (执行前)';

// 此时a模块正在加载中，require(a)会从缓存中获取a模块未完全执行的exports对象
const a = require('./circular_a.js');
console.log('circular_b.js: circular_a.js 加载完毕, a.message_a:', a.message_a); // a.message_a 应该是 "消息来自 a.js (执行前)"
console.log('circular_b.js: circular_a.js 加载完毕, a.is_a_loaded:', a.loaded_a); // a.loaded_a 应该是 true

exports.message_b = '消息来自 b.js (执行后)';
console.log('circular_b.js: 文件执行完毕'); 