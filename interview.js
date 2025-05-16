// 面试题1：使用闭包解决 for 循环中的 var 声明问题

// 问题演示：使用 var 的错误方式
console.log('错误示例：');
for (var i = 1; i <= 5; i++) {
    setTimeout(() => {
        console.log(i);  // 会打印出 6,6,6,6,6
    }, 1000);
}

// 解决方案1：使用闭包
console.log('\n解决方案1 - 使用闭包：');
for (var i = 1; i <= 5; i++) {
    (function(num) {
        setTimeout(() => {
            console.log(num);  // 会正确打印出 1,2,3,4,5
        }, 1000);
    })(i);
}

// 解决方案2：使用 let（现代解决方案）
console.log('\n解决方案2 - 使用 let：');
for (let i = 1; i <= 5; i++) {
    setTimeout(() => {
        console.log(i);  // 会正确打印出 1,2,3,4,5
    }, 1000);
}
