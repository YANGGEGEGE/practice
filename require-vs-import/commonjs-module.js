// 首先定义 sum 函数
exports.sum = function(a, b) {
  return a + b;
};

// 方式2：多个导出
module.exports = {
  multiply: function(a, b) {
    return a * b;
  },
  divide: function(a, b) {
    if (b === 0) throw new Error('除数不能为零');
    return a / b;
  },
  name: 'CommonJS模块',
  // sum: function(a, b) {
  //   return a + b;
  // }
};

// 将新属性添加到 module.exports
module.exports.multiply = function(a, b) {
  return a * b;
};
module.exports.divide = function(a, b) {
  if (b === 0) throw new Error('除数不能为零');
  return a / b;
};
module.exports.name = 'CommonJS模块'; 