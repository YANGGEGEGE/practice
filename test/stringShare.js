console.log("---------------字符串操作方法-----------------")
//字符串操作方法leetcode javascript 前端 常用
let str = "hello world"
console.log(str.charAt(0))  //或者直接str[0]
console.log(str.indexOf("world"))
console.log(str.lastIndexOf("world"))
console.log(str.slice(0, 5))  // "hello"
console.log(str.slice(-5))  // "world" (支持负数，从末尾开始)
console.log(str.split(" "))
//数组转字符串
console.log(str.join(" "))
console.log(str.replace("world", "world2"))
console.log(str.replaceAll("world", "world2"))

//字符串反转
console.log("---------------字符串反转-----------------")
console.log("原字符串:",str)
str = str.split("").reverse().join("")
console.log("反转后字符串:",str)

//最长公共前缀
console.log("---------------最长公共前缀-----------------")
console.log("输入：strs = ['flower','flow','flight']")
console.log("输出：'fl'")

var longestCommonPrefix = function(strs) {
    var re = '';
    if (!strs.length) return re;
    for (var j=0;j<strs[0].length;j++){//第j位
        for (var i=1;i<strs.length;i++){//第i个
          if (strs[i][j] == strs[0][j]) 
              continue
          else
              return re
        }
        re += strs[0][j];
    }
    return re;
};
console.log(longestCommonPrefix(["flower", "flow", "flight"]))

