//数组操作方法leetcode javascript 前端 常用
let arr = [1, 2, 3, 4, 5]
console.log(arr.indexOf(3))
console.log(arr.lastIndexOf(3))
console.log(arr.slice(0, 3))
console.log(arr.slice(-3))
console.log(arr.join(" "))
console.log(arr.reverse())
console.log(arr.sort())
console.log(arr.concat([6, 7, 8]))
console.log(arr.push(6))
console.log(arr.pop())
console.log(arr.shift())
console.log(arr.unshift(0))
console.log(arr.splice(0, 3))
console.log(arr.splice(0, 3, 10))
console.log(arr.splice(0, 3, 10, 20, 30))
console.log('--------------splice用法---------------------\n')
/*splice用法：
arr.splice(start, deleteCount, item1, item2, ...)
start：开始位置
deleteCount：删除数量
item1, item2, ...：添加的元素
*/
arr = [1, 2, 3, 4, 5]
// 从索引0开始删除3个元素，返回被删除的元素 [1, 2, 3]
// splice会改变原数组！此时 arr = [4, 5]
console.log(arr.splice(0, 3))  // 输出: [ 1, 2, 3 ]

// 打印当前数组，此时 arr = [4, 5]
console.log(arr)  // 输出: [ 4, 5 ]

// 从索引0开始删除3个元素（但数组只有2个，所以只删除2个），然后插入10
// 返回被删除的元素 [4, 5]，此时 arr = [10]
console.log(arr.splice(0, 3, 10))  // 输出: [ 4, 5 ]

//从索引0开始删除3个元素（但数组只有1个，所以只删除1个），然后插入10, 20, 30
// 返回被删除的元素 [10]，此时 arr = [10, 20, 30]
console.log(arr.splice(0, 3, 10, 20, 30))  // 输出: [ 10 ]

// 验证最终数组
console.log("最终数组:", arr)  // 输出: [ 10, 20, 30 ]

console.log('--------------reduce用法---------------------\n')
/*reduce用法：
arr.reduce(callback(accumulator, currentValue, currentIndex, array), initialValue)
callback：回调函数
accumulator：累加器
currentValue：当前值
currentIndex：当前索引
array：数组
initialValue：初始值
*/
arr = [1, 2, 3, 4, 5]
console.log(arr.reduce((acc, cur) => acc + cur, 0))
console.log('--------前端常见用法reduce,业务中使用场景---------------------\n')

// 1. 数组求和（购物车总价、订单总金额等）
const cart = [
  { name: '商品A', price: 100, quantity: 2 },
  { name: '商品B', price: 200, quantity: 1 },
  { name: '商品C', price: 50, quantity: 3 }
] 
const totalPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0)
console.log('购物车总价:', totalPrice)  // 输出: 550

// 2. 数组转对象（常用于将数组转为以某个字段为key的对象，方便查找）
const users = [
  { id: 1, name: '张三', age: 20 },
  { id: 2, name: '李四', age: 25 },
  { id: 3, name: '王五', age: 30 }
]
const userMap = users.reduce((acc, user) => {
  acc[user.id] = user
  return acc
}, {})
console.log('用户Map:', userMap)  // { 1: {id:1, name:'张三'...}, 2: {...}, 3: {...} }

// 3. 数组分组（按某个字段分组，如按部门、按状态等）
const orders = [
  { id: 1, status: 'pending', amount: 100 },
  { id: 2, status: 'completed', amount: 200 },
  { id: 3, status: 'pending', amount: 150 },
  { id: 4, status: 'completed', amount: 300 }
]
const groupedOrders = orders.reduce((acc, order) => {
  if (!acc[order.status]) {
    acc[order.status] = []
  }
  acc[order.status].push(order)
  return acc
}, {})
console.log('按状态分组的订单:', groupedOrders)
// { pending: [{id:1...}, {id:3...}], completed: [{id:2...}, {id:4...}] }

// 4. 数组去重（对象数组去重）
const duplicateArr = [
  { id: 1, name: 'A' },
  { id: 2, name: 'B' },
  { id: 1, name: 'A' },
  { id: 3, name: 'C' }
]
const uniqueArr = duplicateArr.reduce((acc, item) => {
  if (!acc.find(x => x.id === item.id)) {
    acc.push(item)
  }
  return acc
}, [])
console.log('去重后的数组:', uniqueArr)



// 6. 扁平化数组（多维数组转一维）
const nestedArr = [[1, 2], [3, 4], [5, [6, 7]]]
const flatArr = nestedArr.reduce((acc, cur) => {
  return acc.concat(Array.isArray(cur) ? cur.flat() : cur)
}, [])
 
//递归扁平化数组
function flatten(arr) {
  let result = []
  for (let i = 0; i < arr.length; i++) {
    if (Array.isArray(arr[i])) {
      // 如果是数组，递归调用 flatten
      result = result.concat(flatten(arr[i]))
    } else {
      // 如果不是数组，直接添加到结果中
      result.push(arr[i])
    }
  }
  return result
}

console.log('递归扁平化数组:', flatten(nestedArr))
console.log('扁平化数组:', flatArr)  // [1, 2, 3, 4, 5, 6, 7]


// 8. 条件累加（满足条件的元素累加）
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const evenSum = numbers.reduce((acc, num) => {
  if (num % 2 === 0) {
    return acc + num
  }
  return acc
}, 0)
console.log('偶数之和:', evenSum)  // 30



// 9. 数组转Map结构（更高效的查找）
const productMap = cart.reduce((acc, item) => {
  acc.set(item.name, item)
  return acc
}, new Map())
console.log('商品Map:', productMap)

// 10. 合并多个对象的属性（配置合并、数据聚合）
const configs = [
  { theme: 'dark', lang: 'zh' },
  { fontSize: 14, lang: 'en' },
  { theme: 'light' }
]
const mergedConfig = configs.reduce((acc, config) => {
  return { ...acc, ...config }
}, {})
console.log('合并后的配置:', mergedConfig)  // { theme: 'light', lang: 'en', fontSize: 14 }


console.log('--------------filter用法---------------------\n')
/*filter用法：
arr.filter(callback(currentValue, currentIndex, array), thisValue)
callback：回调函数
currentValue：当前值
currentIndex：当前索引
array：数组  
thisValue：可选，指定回调函数中的this值
*/
arr = [1, 2, 3, 4, 5]
console.log(arr.filter((item) => item > 3))

console.log('--------------find用法---------------------\n')
/*find用法：
arr.find(callback(currentValue, currentIndex, array), thisValue)
callback：回调函数
currentValue：当前值
currentIndex：当前索引
array：数组
thisValue：可选，指定回调函数中的this值
*/
arr = [1, 2, 3, 4, 5]
console.log(arr.find((item) => item > 3))

console.log('--------------数组方法总结：改变原数组 vs 不改变原数组---------------------\n')

// ========== 会改变原数组的方法（Mutating Methods）==========
console.log('【会改变原数组的方法】')
let testArr1 = [1, 2, 3, 4, 5]

// 1. push() - 在数组末尾添加元素，返回新长度
console.log('push:', testArr1.push(6))  // 返回: 6
console.log('原数组:', testArr1)  // [1, 2, 3, 4, 5, 6] ✓ 已改变

// 2. pop() - 删除数组末尾元素，返回被删除的元素
testArr1 = [1, 2, 3, 4, 5]
console.log('pop:', testArr1.pop())  // 返回: 5
console.log('原数组:', testArr1)  // [1, 2, 3, 4] ✓ 已改变

// 3. shift() - 删除数组开头元素，返回被删除的元素
testArr1 = [1, 2, 3, 4, 5]
console.log('shift:', testArr1.shift())  // 返回: 1
console.log('原数组:', testArr1)  // [2, 3, 4, 5] ✓ 已改变

// 4. unshift() - 在数组开头添加元素，返回新长度
testArr1 = [1, 2, 3, 4, 5]
console.log('unshift:', testArr1.unshift(0))  // 返回: 6
console.log('原数组:', testArr1)  // [0, 1, 2, 3, 4, 5] ✓ 已改变

// 5. splice() - 删除/插入元素，返回被删除的元素数组
testArr1 = [1, 2, 3, 4, 5]
console.log('splice:', testArr1.splice(1, 2, 'a', 'b'))  // 返回: [2, 3]
console.log('原数组:', testArr1)  // [1, 'a', 'b', 4, 5] ✓ 已改变

// 6. reverse() - 反转数组，返回反转后的数组
testArr1 = [1, 2, 3, 4, 5]
console.log('reverse:', testArr1.reverse())  // 返回: [5, 4, 3, 2, 1]
console.log('原数组:', testArr1)  // [5, 4, 3, 2, 1] ✓ 已改变

// 7. sort() - 排序数组，返回排序后的数组
testArr1 = [3, 1, 4, 2, 5]
console.log('sort:', testArr1.sort())  // 返回: [1, 2, 3, 4, 5]
console.log('原数组:', testArr1)  // [1, 2, 3, 4, 5] ✓ 已改变

// 8. fill() - 填充数组，返回填充后的数组
testArr1 = [1, 2, 3, 4, 5]
console.log('fill:', testArr1.fill(0, 1, 3))  // 返回: [1, 0, 0, 4, 5]
console.log('原数组:', testArr1)  // [1, 0, 0, 4, 5] ✓ 已改变


console.log('\n【不会改变原数组的方法】')
let testArr2 = [1, 2, 3, 4, 5]

// 1. slice() - 返回新数组
console.log('slice:', testArr2.slice(1, 3))  // 返回: [2, 3]
console.log('原数组:', testArr2)  // [1, 2, 3, 4, 5] ✗ 未改变

// 2. concat() - 返回新数组
console.log('concat:', testArr2.concat([6, 7]))  // 返回: [1, 2, 3, 4, 5, 6, 7]
console.log('原数组:', testArr2)  // [1, 2, 3, 4, 5] ✗ 未改变

// 3. join() - 返回字符串
console.log('join:', testArr2.join('-'))  // 返回: "1-2-3-4-5"
console.log('原数组:', testArr2)  // [1, 2, 3, 4, 5] ✗ 未改变

// 4. indexOf() / lastIndexOf() - 返回索引
console.log('indexOf:', testArr2.indexOf(3))  // 返回: 2
console.log('原数组:', testArr2)  // [1, 2, 3, 4, 5] ✗ 未改变

// 5. includes() - 返回布尔值
console.log('includes:', testArr2.includes(3))  // 返回: true
console.log('原数组:', testArr2)  // [1, 2, 3, 4, 5] ✗ 未改变

// 6. find() / findIndex() - 返回元素或索引
console.log('find:', testArr2.find(x => x > 3))  // 返回: 4
console.log('原数组:', testArr2)  // [1, 2, 3, 4, 5] ✗ 未改变

// 7. filter() - 返回新数组
console.log('filter:', testArr2.filter(x => x > 3))  // 返回: [4, 5]
console.log('原数组:', testArr2)  // [1, 2, 3, 4, 5] ✗ 未改变

// 8. map() - 返回新数组
console.log('map:', testArr2.map(x => x * 2))  // 返回: [2, 4, 6, 8, 10]
console.log('原数组:', testArr2)  // [1, 2, 3, 4, 5] ✗ 未改变

// 9. reduce() / reduceRight() - 返回累加值
console.log('reduce:', testArr2.reduce((acc, cur) => acc + cur, 0))  // 返回: 15
console.log('原数组:', testArr2)  // [1, 2, 3, 4, 5] ✗ 未改变

// 10. forEach() - 不返回值
testArr2.forEach(x => console.log('forEach:', x))
console.log('原数组:', testArr2)  // [1, 2, 3, 4, 5] ✗ 未改变

// 11. some() / every() - 返回布尔值
console.log('some:', testArr2.some(x => x > 3))  // 返回: true
console.log('every:', testArr2.every(x => x > 0))  // 返回: true
console.log('原数组:', testArr2)  // [1, 2, 3, 4, 5] ✗ 未改变

// 12. flat() / flatMap() - 返回新数组
const nested = [[1, 2], [3, 4]]
console.log('flat:', nested.flat())  // 返回: [1, 2, 3, 4]
console.log('原数组:', nested)  // [[1, 2], [3, 4]] ✗ 未改变

console.log('\n【总结】')
console.log('会改变原数组: push, pop, shift, unshift, splice, reverse, sort, fill')
console.log('不改变原数组: slice, concat, join, indexOf, lastIndexOf, includes, find, findIndex,')
console.log('              filter, map, reduce, reduceRight, forEach, some, every, flat, flatMap')

