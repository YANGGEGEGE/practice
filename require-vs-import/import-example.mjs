// ES Module 的导入方式 (import)
// 注意: 需要使用 .mjs 扩展名或在 package.json 中设置 "type": "module"

// 导入默认导出
import defaultExport from './es-module.js';
console.log('ES模块名称:', defaultExport.name);
console.log('乘法结果:', defaultExport.multiply(5, 3));

// 导入命名导出
import { sum, subtract } from './es-module.js';
console.log('加法结果:', sum(5, 3));
console.log('减法结果:', subtract(5, 3));

// 导入所有命名导出
import * as allExports from './es-module.js';
console.log('通过命名空间访问:', allExports.sum(10, 5));

// 动态导入 (ES2020+)
async function dynamicImport() {
  const module = await import('./es-module.js');
  console.log('动态导入结果:', module.default.name);
  console.log('动态导入命名导出:', module.sum(20, 10));
}
dynamicImport();

// import 特点:
// 1. 静态分析 - 编译时确定依赖关系
// 2. 异步加载 - 不阻塞执行
// 3. 导入的是模块的绑定（引用），原模块变化会反映到导入的值
// 4. 支持导入重命名 import { sum as add } from './module'
// 5. 严格模式 - 不需要 'use strict'
// 6. 支持 tree shaking - 只导入需要的代码 