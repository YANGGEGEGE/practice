# Node CJS和ESM混合开发

## 为什么会存在CJS和ESM混合开发？
npm 模块有的使用 CJS 有的使用 ESM，导致 CJS 和 ESM 混合开发成为 Node 项目必须考虑的问题

## 场景1：CommonJS单独使用
CJS 文件定义方法：
- 默认 .js 后缀的文件为 CJS。 
- .cjs 后缀的文件强制为 CJS。 
- package.json 中 type="commonjs" 时，.js 文件会被认为是 CJS。

> 踩坑：module.exports 和 exports.fn 混用问题

## 场景2：ESM单独使用
ESM 文件定义方法：
- package.json 中 type="module" 时，.js 后缀文件会被识别为 ESM。 
- .mjs 后缀的文件会被强制识别为 ESM。

> 踩坑：__filename, __dirname 无法使用，[解决方案](https://www.npmjs.com/package/dirname-filename-esm)

```js
// In ".mjs" script or a script under "type": "module" package
import { dirname, filename } from 'dirname-filename-esm';

const __dirname = dirname(import.meta);
const __filename = filename(import.meta);

// Use __dirname and __filename like under commonjs module
```

## 场景3：CommonJS和ESM混用
原则：
- 单个模块必须指定CommonJS和ESM，不可混用，如果混用，必须使用webpack或者babel进行解决
- package.json的type必须指定一种模块，如果不指定默认为commonjs，但越来越多的模块采用module（ESM）

### 场景3.1：CommonJS兼容ESM
```js
import('esm').then(({a, b}) => {
  a();
  b();
});
```

### 场景3.2：ESM兼容CommonJS
```js
import { a, b } from 'cjs';

a();
b();
```

## 常见错误

### 错误1：type和语法不匹配
常见错误：
```bash
node packages/esm_entry/    
(node:16435) Warning: To load an ES module, set "type": "module" in the package.json or use the .mjs extension.
(Use `node --trace-warnings ...` to show where the warning was created)
/Users/sam/Desktop/fe_arch_source_code/imooc-test/module/packages/esm_entry/lib/index.js:1
import cjs from 'cjs';
^^^^^^

SyntaxError: Cannot use import statement outside a module
```
错误原因：
- 未指定 package.json 的 type，默认采用 commonjs
- js 源码中使用了 ESM 语法，如 import 或 export 等

解决方案：
- 修改 js 为 mjs（不建议使用）
- 修改 type 为 module

### 错误2：require 无法加载 ESM 模块
使用 require 加载 ESM 模块会出现报错：
```bash
internal/modules/cjs/loader.js:1102
      throw new ERR_REQUIRE_ESM(filename, parentPath, packageJsonPath);
      ^

Error [ERR_REQUIRE_ESM]: Must use import to load ES Module: /Users/sam/Desktop/fe_arch_source_code/imooc-test/module/packages/esm/lib/index.js
require() of ES modules is not supported.
```
解决方案：使用 import 方法加载

### 错误3：ESM 模块加载其他模块问题
使用以下代码：
```js
import a from './a';
```
会出现报错：
```bash
internal/process/esm_loader.js:74
    internalBinding('errors').triggerUncaughtException(
                              ^

Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/Users/sam/Desktop/fe_arch_source_code/imooc-test/module/packages/esm/lib/a' imported from /Users/sam/Desktop/fe_arch_source_code/imooc-test/module/packages/esm/lib/index.js
```
解决方案：
```js
import a from './a.js';
```
