import chalk from 'chalk';

// red
// console.log('\x1b[31mhello imooc\x1b[39m');
// console.log('\u001b[31mhello imooc\u001b[39m');

// blue
// console.log('\u001b[42m\u001b[34mhello imooc\u001b[39m\u001b[49m');

// ansi转义字符汇总和定义
// console.log(chalk.red('hello imooc'));

// 特殊字符
// \n
// console.log('\u001b[31mhello\u001b[39m\n\u001b[31mimooc\u001b[39m');
// console.log(chalk.red('hello imooc\nhello imooc2\nhello imooc3'));
// \u001b
// console.log(chalk.red('\u001b[31mhi~\u001b[39mall right'));

// 链式调用
console.log(chalk.red.bold('\u001b[32mhello\u001b[39m imooc'));
