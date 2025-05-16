// 闭包面试题示例

// 例题1：基本闭包概念
console.log("例题1：基本闭包概念");

function createCounter() {
  let count = 0;
  
  return function() {
    count++;
    return count;
  };
}

const counter1 = createCounter();
const counter2 = createCounter();

console.log(counter1()); // 1
console.log(counter1()); // 2
console.log(counter2()); // 1 - 独立的闭包

// 例题2：循环中的闭包陷阱
console.log("\n例题2：循环中的闭包陷阱");

function withoutClosure() {
  const fns = [];
  
  for (var i = 0; i < 3; i++) {
    fns.push(function() {
      console.log(`withoutClosure: ${i}`);
    });
  }
  
  return fns;
}

function withClosure() {
  const fns = [];
  
  for (var i = 0; i < 3; i++) {
    // 使用IIFE创建闭包
    (function(j) {
      fns.push(function() {
        console.log(`withClosure: ${j}`);
      });
    })(i);
  }
  
  return fns;
}

function withES6() {
  const fns = [];
  
  for (let i = 0; i < 3; i++) {
    fns.push(function() {
      console.log(`withES6: ${i}`);
    });
  }
  
  return fns;
}

const fns1 = withoutClosure();
const fns2 = withClosure();
const fns3 = withES6();

for (let fn of fns1) fn(); // 全部输出 3
for (let fn of fns2) fn(); // 输出 0, 1, 2
for (let fn of fns3) fn(); // 输出 0, 1, 2

// 例题3：闭包实现私有变量
console.log("\n例题3：闭包实现私有变量");

function createBankAccount(initialBalance) {
  let balance = initialBalance;
  
  return {
    getBalance: function() {
      return balance;
    },
    deposit: function(amount) {
      balance += amount;
      return balance;
    },
    withdraw: function(amount) {
      if (amount > balance) {
        return "余额不足";
      }
      balance -= amount;
      return balance;
    }
  };
}

const account = createBankAccount(100);
console.log("初始余额:", account.getBalance());
console.log("存款后:", account.deposit(50));
console.log("取款后:", account.withdraw(30));
console.log("余额不足:", account.withdraw(500));
// console.log(account.balance); // 这是undefined，无法直接访问

// 例题4：闭包内存泄漏
console.log("\n例题4：闭包内存泄漏示例");

function potentialLeak() {
  const largeData = new Array(1000000).fill('某些数据');
  
  return function() {
    // 即使只使用了largeData的一小部分
    console.log(`数据长度: ${largeData.length}`);
  };
}

const leakyFunction = potentialLeak();
leakyFunction(); // largeData整个数组都会被保留在内存中 