console.log('circular_a.js: 文件开始执行');
exports.loaded_a = true;
exports.message_a = '消息来自 a.js (执行前)';

// 在b模块加载前，a模块的exports对象已经创建并在缓存中
// b模块require(a)时，会拿到这个部分构造的exports对象
const b = require('./circular_b.js');
console.log('circular_a.js: circular_b.js 加载完毕, b.message_b:', b.message_b);
console.log('circular_a.js: circular_b.js 加载完毕, b.is_b_loaded:', b.loaded_b); // b.loaded_b 应该是 true

exports.message_a = '消息来自 a.js (执行后)'; // 修改导出
console.log('circular_a.js: 文件执行完毕'); 