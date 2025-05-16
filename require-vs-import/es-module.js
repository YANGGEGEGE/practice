// ES Module 导出方式
// 方式1：命名导出
export const sum = (a, b) => a + b;
export const subtract = (a, b) => a - b;

// 方式2：默认导出
export default {
  multiply: (a, b) => a * b,
  divide: (a, b) => {
    if (b === 0) throw new Error('除数不能为零');
    return a / b;
  },
  name: 'ES模块'
};

// 可以同时使用命名导出和默认导出 