// CommonJS 的导入方式 (require)

// 导入整个模块
// 1. 同步加载示例：下面的 require 调用会阻塞后续代码的执行，直到 './commonjs-module' 加载并执行完毕。
//    控制台会先输出 commonjs-module.js 内部的console.log (如果有), 然后才会继续执行这里的 console.log。
const mathModule = require('./commonjs-module');
console.log('CommonJS模块名称 (初始):', mathModule.name);
// console.log('乘法结果:', mathModule.multiply(5, 3)); // 假设 sum 现在不在 mathModule 中
// console.log('加法结果:', mathModule.sum(5, 3)); // 假设 sum 现在不在 mathModule 中

if (mathModule.multiply) {
    console.log('乘法结果:', mathModule.multiply(5, 3));
}
if (mathModule.sum) { // 检查sum是否存在，因为上一个步骤中它可能被移除了
    console.log('加法结果:', mathModule.sum(5, 3));
} else if (mathModule.divide) { // 作为替代，如果sum不在，可以调用divide
    console.log('替代调用 - 除法结果:', mathModule.divide(10,2)); 
}

// 使用解构赋值
const { divide } = require('./commonjs-module'); // 注意：如果 commonjs-module 被修改，divide 可能不存在
if (divide) {
    console.log('解构赋值 - 除法结果:', divide(10, 2));
} else {
    console.log('解构赋值 - divide 函数未从模块导出。');
}


// 动态导入
const modulePath = './commonjs-module';
const dynamicModule = require(modulePath);
console.log('动态导入模块名称:', dynamicModule.name);

console.log('\n--- require 特点示例 ---');

// 1. 同步加载 - 阻塞代码执行直到模块加载完成
//    上面的 require('./commonjs-module') 已经演示了这一点。
//    为了更清晰地看到阻塞效果，可以想象一个加载非常耗时的模块：
//    console.log('准备加载大型模块...');
//    const largeModule = require('./very-large-module'); // 这会阻塞
//    console.log('大型模块加载完毕!');

// 2. 可以在条件语句中使用 (已通过动态导入间接演示，直接的例子如下)
let conditionalModule;
const condition = true;
if (condition) {
    conditionalModule = require('./commonjs-module');
    console.log('条件加载模块名称:', conditionalModule.name);
} else {
    // conditionalModule = require('./another-module'); // 仅在条件为false时加载
    console.log('条件为false，未加载 commonjs-module');
}

// 3. 可以动态计算模块路径 (已在上面的动态导入部分演示)
//    const moduleNamePart = 'commonjs';
//    const dynamicPathModule = require(`./${moduleNamePart}-module`);
//    console.log('动态路径计算模块名称:', dynamicPathModule.name);

// 4. 导入的是模块导出值的拷贝（对于原始类型）或引用的拷贝（对于对象）。
//    对导入的变量重新赋值不会影响模块缓存中的原始导出对象。
//    如果导出的是对象，修改该对象的属性会影响到所有引入该模块的地方（因为它们都指向缓存中的同一个对象）。
console.log('\n示例点 4: 导入值的特性');
const moduleInstance1 = require('./commonjs-module');
let moduleInstance2 = require('./commonjs-module'); // instance1 和 instance2 指向同一个缓存对象

console.log('初始: moduleInstance1.name =', moduleInstance1.name);
console.log('初始: moduleInstance2.name =', moduleInstance2.name);

// 修改 moduleInstance1 指向的对象的属性
if (moduleInstance1 && typeof moduleInstance1.name !== 'undefined') {
    moduleInstance1.name = '通过 instance1 修改的名称';
    console.log('修改后: moduleInstance1.name =', moduleInstance1.name);
    // 因为 moduleInstance2 指向同一个缓存对象，所以它的 name 属性也会改变
    console.log('修改后: moduleInstance2.name (应与instance1同步) =', moduleInstance2.name);
} else {
    console.log('moduleInstance1 或其 name 属性未定义，跳过修改。');
}


// 尝试重新赋值 moduleInstance2 变量本身
// 这只会改变 moduleInstance2 这个局部变量的指向，不会影响 moduleInstance1 或模块缓存中的对象
moduleInstance2 = { name: '全新的对象赋值给 instance2', message: '这不会影响模块缓存' };
console.log('重新赋值后: moduleInstance2.name =', moduleInstance2.name);
console.log('重新赋值后: moduleInstance1.name (应保持上次修改的值) =', moduleInstance1.name);

const moduleInstance3 = require('./commonjs-module'); // 再次 require，应获取缓存中被 instance1 修改过的对象
console.log('重新赋值后: moduleInstance3.name (应与instance1同步) =', moduleInstance3.name);

// 5. 循环依赖时采用缓存机制处理
//    为了演示这一点，我们将创建两个互相引用的模块: circular_a.js 和 circular_b.js
//    circular_a.js 会 require circular_b.js
//    circular_b.js 会 require circular_a.js
//    Node.js 通过在模块执行完成前就将其部分导出的exports对象放入缓存来打破无限循环。
console.log('\n示例点 5: 循环依赖处理');
console.log('准备加载 circular_a.js (它会尝试加载 circular_b.js)...');
const circularA = require('./circular_a.js');
console.log('--- require-example.js: circular_a 加载完毕 ---');
console.log('circularA.message_a:', circularA.message_a); // 应为 '消息来自 a.js (执行后)'
console.log('circularA.loaded_a:', circularA.loaded_a);

// 通常不需要再次显式 require circular_b，因为它已作为 circular_a 的依赖被加载
// 但为了验证，我们可以再次 require 它，它会从缓存中获取
const circularB_cached = require('./circular_b.js');
console.log('--- require-example.js: circular_b (从缓存) 加载完毕 ---');
console.log('circularB_cached.message_b:', circularB_cached.message_b); // 应为 '消息来自 b.js (执行后)'
console.log('circularB_cached.loaded_b:', circularB_cached.loaded_b);

// 打印 circularA 中从 B 获取的内容，展示 B 在 A 加载 B 时已经可以访问 A 的部分导出
// (这部分逻辑在 circular_a.js 和 circular_b.js 内部的 console.log 中更为清晰)

console.log('\n--- require 特点示例结束 ---'); 