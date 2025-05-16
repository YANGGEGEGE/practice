// 箭头函数面试题示例

// 例题1：this绑定问题
console.log("例题1：箭头函数与普通函数的this绑定区别");

const person = {
  name: '张三',
  sayNameFunction: function() {
    console.log(`普通函数: 我的名字是 ${this.name}`);
  },
  sayNameArrow: () => {
    console.log(`箭头函数: 我的名字是 ${this.name}`);
  }
};

person.sayNameFunction(); // 输出：普通函数: 我的名字是 张三
person.sayNameArrow();    // 输出：箭头函数: 我的名字是 undefined

// 例题2：arguments对象
console.log("\n例题2：箭头函数没有arguments对象");

function regularFunction() {
  console.log("普通函数arguments:", arguments);
}

const arrowFunction = (...args) => {
  // 箭头函数中没有arguments对象，需要使用rest参数
  console.log("箭头函数args:", args);
  // console.log(arguments); // 这会报错
};

regularFunction(1, 2, 3);
arrowFunction(1, 2, 3);

// 例题3：箭头函数不能用作构造函数
console.log("\n例题3：箭头函数不能用作构造函数");

function RegularPerson(name) {
  this.name = name;
}

const ArrowPerson = (name) => {
  this.name = name;
};

try {
  const person1 = new RegularPerson("李四");
  console.log("普通函数构造对象:", person1.name);
  
  const person2 = new ArrowPerson("王五"); // 这会抛出错误
} catch (error) {
  console.log("箭头函数构造错误:", error.message);
}

// 例题4：箭头函数的简洁语法
console.log("\n例题4：箭头函数的简洁语法");

const numbers = [1, 2, 3, 4, 5];

// 普通函数
const doubledRegular = numbers.map(function(num) {
  return num * 2;
});
console.log("普通函数映射:", doubledRegular);

// 箭头函数
const doubledArrow = numbers.map(num => num * 2);
console.log("箭头函数映射:", doubledArrow); 