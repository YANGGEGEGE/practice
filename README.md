A0
C0
推荐使用vite创建react项目
npm create vite@latest my-react-app -- --template react

### nvm 使用技巧

#### 解决 nvm 在国内网络环境下的访问问题

当遇到 `nvm install` 或 `nvm ls-remote` 无法访问或速度慢的问题时，可以使用国内镜像源：

```bash
# 设置 Node.js 镜像源为淘宝镜像
export NVM_NODEJS_ORG_MIRROR=https://npmmirror.com/mirrors/node/

# 然后执行 nvm 命令
nvm ls-remote  # 列出所有可用的 Node.js 版本
nvm install 20  # 安装 Node.js v20
```

这样可以显著提高下载速度并解决网络访问问题。

#### 持久化配置

可以将镜像设置添加到你的 shell 配置文件中（如 ~/.bashrc、~/.zshrc 等）：

```bash
echo 'export NVM_NODEJS_ORG_MIRROR=https://npmmirror.com/mirrors/node/' >> ~/.zshrc
source ~/.zshrc
```

## `require` (CommonJS) vs `import` (ES Modules) 加载机制底层原理

在 Node.js 中，`require` (CommonJS 模块) 和 `import` (ES 模块) 是两种主要的模块加载方式，它们的底层原理和行为有所不同。

### `require` (CommonJS)

CommonJS 模块是 Node.js 最早支持的模块系统。其加载机制大致如下：

1.  **路径解析与定位 (Path Resolution & Locating):**
    *   当使用 `require('module-name')` 时，Node.js 会尝试解析 `module-name`。
    *   **核心模块:** 如果 `module-name` 是 Node.js 的核心模块 (如 `fs`, `http`)，则直接返回该模块的导出。
    *   **文件模块:**
        *   如果以 `/`, `./`, `../` 开头，则视为文件路径。Node.js 会尝试加载 `.js`, `.json`, `.node` (C++ 插件) 文件。
        *   如果没有指定扩展名，Node.js 会按顺序尝试添加这些扩展名。
        *   如果路径指向一个目录，Node.js 会查找该目录下的 `package.json` 文件中的 `main` 字段指定的主文件，或者尝试加载目录下的 `index.js`, `index.json`, `index.node`。
    *   **第三方模块 (node_modules):** 如果既不是核心模块也不是文件路径，Node.js 会从当前目录的 `node_modules` 文件夹开始，逐级向上到父目录的 `node_modules` 文件夹查找，直到找到模块或到达根目录。

2.  **模块加载与编译 (Loading & Compiling):**
    *   找到模块文件后，Node.js 会读取文件内容。
    *   对于 `.js` 文件，Node.js 会将模块代码包裹在一个函数包装器 (wrapper function) 中，类似这样：
        ```javascript
        (function(exports, require, module, __filename, __dirname) {
          // 你的模块代码在这里
        });
        ```
    *   这个包装器提供了模块作用域内的全局变量，如 `exports` (用于导出)、`require` (用于引入其他模块)、`module` (包含模块元信息和 `module.exports`)、`__filename` (当前模块的绝对路径) 和 `__dirname` (当前模块所在目录的绝对路径)。

3.  **执行与缓存 (Execution & Caching):**
    *   包装后的代码被执行。模块通过给 `module.exports` 赋值或向 `exports` 对象添加属性来导出其 API。
    *   **同步加载:** `require` 是同步执行的。这意味着在模块代码执行完毕并返回 `module.exports` 之前，后续代码会阻塞。
    *   **缓存:** 模块在第一次被 `require` 后会被缓存。后续对同一个模块的 `require` 调用会直接从缓存中获取导出的对象，模块代码不会再次执行。缓存的键是模块的绝对路径。

4.  **导出 (`module.exports` vs `exports`):**
    *   `module.exports` 是模块实际导出的内容。
    *   `exports` 只是 `module.exports` 的一个初始引用。你可以通过 `exports.foo = ...` 来导出，这等同于 `module.exports.foo = ...`。
    *   **注意:** 如果你直接给 `exports` 赋一个新的值 (如 `exports = function() {}`)，它会断开与 `module.exports` 的引用关系，导致模块没有正确导出。要改变模块导出的整体结构，应该直接修改 `module.exports` (如 `module.exports = function() {}`)。

### `import` (ES Modules - ESM)

ES Modules 是 ECMAScript 语言规范中定义的官方模块系统，Node.js 在较新的版本中也提供了原生支持。

1.  **解析与加载 (Parsing & Loading):**
    *   **静态解析:** `import` 语句是静态的。这意味着模块的依赖关系在代码执行前（编译阶段）就被确定。这使得工具可以进行静态分析、摇树优化 (tree-shaking) 等。
    *   `import` 语句必须在模块的顶层作用域使用，不能在条件语句或函数内部动态使用（虽然有动态 `import()` 语法）。
    *   模块路径解析规则与 CommonJS 类似，但也支持 URL 风格的路径和 `import maps` (一种控制模块解析的机制)。
    *   Node.js 通过 `package.json` 中的 `"type": "module"` 字段或文件扩展名 `.mjs` 来识别 ES 模块。`.cjs` 则明确指定为 CommonJS 模块。

2.  **编译 (Compilation):**
    *   ES 模块在执行前会被解析和编译。

3.  **实例化 (Instantiation):**
    *   模块加载器会为每个模块创建一个模块记录 (Module Record)，包含代码、导入和导出。
    *   然后，它会连接所有模块的导入和导出，形成一个依赖图。这个阶段主要处理内存空间的分配，但尚未执行代码。

4.  **求值 (Evaluation):**
    *   **异步加载倾向：** ES 模块的设计更倾向于异步加载，尽管在 Node.js 中顶层的模块加载目前主要还是同步完成的（但动态 `import()` 是异步的）。
    *   代码按照依赖顺序执行。如果模块 A 依赖模块 B，模块 B 的代码会先执行。
    *   **导出 (`export`):** 使用 `export` 关键字导出。
        *   命名导出: `export const foo = ...;` 或 `export { var1, var2 };`
        *   默认导出: `export default ...;`
    *   **导入 (`import`):**
        *   命名导入: `import { foo } from './module.js';`
        *   默认导入: `import myDefault from './module.js';`
        *   命名空间导入: `import * as myModule from './module.js';`
    *   **动态绑定 (Live Bindings):** ES 模块的导入是导出的实时绑定。如果导出的变量值在模块内部发生变化，导入该变量的地方会反映这个变化。这与 CommonJS 不同，CommonJS 导出的是值的拷贝（对于原始类型）或引用的拷贝（对于对象）。

5.  **缓存:**
    *   与 CommonJS 类似，ES 模块在第一次加载和求值后也会被缓存。后续对同一模块的 `import` 会使用缓存的模块实例。

### 关键区别总结

| 特性           | `require` (CommonJS)                      | `import` (ES Modules)                     |
| -------------- | ----------------------------------------- | ----------------------------------------- |
| **加载时机**   | 运行时 (Runtime)                          | 编译时 (Compile time) / 静态解析         |
| **加载方式**   | 同步 (Synchronous)                        | 设计上支持异步 (Node.js 顶层目前同步，动态 `import()` 异步) |
| **`this` 指向** | 模块顶层 `this` 指向 `module.exports` (非严格模式) 或 `exports` (严格模式下，如果 `this` 被引用，则 `this` 指向 `module.exports`。在 Node.js 模块的顶层作用域中，`this` 通常是 `exports` 对象，也就是 `module.exports` 的初始引用。但如果在严格模式下直接访问顶层 `this`，则为 `undefined`。) | 模块顶层 `this` 是 `undefined`              |
| **导出**       | `module.exports` 或 `exports` 对象赋值   | `export` 关键字                           |
| **导入**       | `require()` 函数调用                      | `import` 关键字                           |
| **动态性**     | 可以动态 `require` (例如在条件语句中基于变量引入模块) | `import` 语句静态，必须在顶层 (有动态 `import()` 函数语法用于运行时加载) |
| **绑定**       | 导出的是值的拷贝 (原始类型) / 引用的拷贝 (对象) | 导出的是实时绑定 (Live Bindings)         |
| **Node.js 支持**| 原生默认支持 (`.js`, `.cjs` 文件)         | 需显式启用 (如 `.mjs` 文件，或 `package.json` 中 `"type": "module"`) |
| **Tree Shaking**| 较难实现                                  | 更易实现，得益于静态结构                |

理解这些底层差异有助于在项目中选择合适的模块系统，并更有效地组织和管理代码。

