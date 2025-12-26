// ============================================
// 📈 股票买卖问题（可以多次交易）
// ============================================
// 输入：prices = [7,1,5,3,6,4]
// 输出：7
// 解释：在第2天买入(1)，第3天卖出(5)，赚4元；第4天买入(3)，第5天卖出(6)，赚3元；总共7元

/**
 * 核心思想：动态规划 - 记录每天两种状态的最大利润
 * dp1[i]：第i天持有股票的最大利润
 * dp2[i]：第i天不持有股票的最大利润
 */
var maxProfit = function(prices) {
    // 初始化：第0天
    let dp1 = [-prices[0]]  // 持有股票的最大利润
    let dp2 = [0]            // 不持有股票的最大利润
    
    // 状态转移：从第1天开始遍历
    for(let i = 1; i < prices.length; i++){
        // 状态1：今天持有股票
        // ① dp1[i-1]：昨天持有股票，今天继续持有
        // ② dp2[i-1] - prices[i]：昨天不持有，今天买入
        dp1[i] = Math.max(dp1[i-1], dp2[i-1] - prices[i])
        
        // 状态2：今天不持有股票
        // ① dp2[i-1]：昨天不持有，今天继续不持有
        // ② dp1[i-1] + prices[i]：昨天持有，今天卖出
        dp2[i] = Math.max(dp2[i-1], dp1[i-1] + prices[i])
    }
    
    console.log('dp1 (持有股票):', dp1)
    console.log('dp2 (不持有股票):', dp2)
    
    // 最后一天不持有股票，利润最大
    return dp2[prices.length - 1]
};

let prices = [7, 1, 5, 3, 6, 4]
console.log('股票最大利润:', maxProfit(prices))
console.log('-----------------------------------\n')


// ============================================
// 🏠 打家劫舍问题
// ============================================
// 输入：nums = [1,2,3,1]
// 输出：4
// 解释：偷窃 1 号房屋 (金额 = 1) ，然后偷窃 3 号房屋 (金额 = 3)。偷窃到的最高金额 = 1 + 3 = 4

/**
 * 核心思想：动态规划 - 记录偷到第i个房子时的最大金额
 * dp[i]：偷到第i个房子时能获得的最大金额
 * 
 * 状态转移方程：
 * dp[i] = max(dp[i-1], dp[i-2] + nums[i])
 * - 不偷第i个房子：dp[i-1]（保持上一个的最大值）
 * - 偷第i个房子：dp[i-2] + nums[i]（因为不能偷相邻的，所以加上i-2的值）
 */
var rob = function(nums) {
    if(nums.length === 0) return 0
    if(nums.length === 1) return nums[0]
    
    // 初始化
    let dp = [nums[0]]  // dp[0]：偷第0个房子
    dp[1] = Math.max(nums[0], nums[1])  // dp[1]：前两个房子中选最大的
    
    // 状态转移：从第2个房子开始遍历
    for(let i = 2; i < nums.length; i++){
        // 状态1：不偷第i个房子，金额为dp[i-1]
        // 状态2：偷第i个房子，金额为dp[i-2] + nums[i]
        dp[i] = Math.max(dp[i-1], dp[i-2] + nums[i])
    }
    
    console.log('dp (每个位置的最大金额):', dp)
    
    // 返回最后一个位置的最大金额
    return dp[nums.length - 1]
};

let nums = [1, 2, 3, 1]
console.log('打家劫舍最大金额:', rob(nums))
console.log('-----------------------------------\n')

// 测试用例2
let nums2 = [2, 7, 9, 3, 1]
console.log('测试用例2:', nums2)
console.log('打家劫舍最大金额:', rob(nums2))
console.log('-----------------------------------\n')


// ============================================
// ➕ 字符串相加问题
// ============================================
// 输入：num1 = "11", num2 = "123"
// 输出："134"
// 解释：模拟大数相加，不能使用BigInteger或直接转换为整数

/**
 * 核心思想：模拟竖式加法 - 从右到左逐位相加，处理进位
 * 
 * 算法步骤：
 * 1. 从两个字符串的末尾开始遍历
 * 2. 每次取对应位的数字相加，加上进位carry
 * 3. 当前位的结果为 (sum % 10)，新的进位为 Math.floor(sum / 10)
 * 4. 继续处理下一位，直到两个字符串都遍历完且无进位
 */
var addStrings = function(num1, num2) {
    let i = num1.length - 1  // num1的指针
    let j = num2.length - 1  // num2的指针
    let carry = 0            // 进位
    let result = []          // 结果数组
    let steps = []           // 记录每一步的计算过程
    
    // 从右到左遍历，直到两个字符串都遍历完且无进位
    while(i >= 0 || j >= 0 || carry > 0) {
        // 获取当前位的数字，如果已经遍历完则为0
        let digit1 = i >= 0 ? parseInt(num1[i]) : 0
        let digit2 = j >= 0 ? parseInt(num2[j]) : 0
        
        // 记录当前的进位（来自上一步）
        let carry_in = carry
        
        // 当前位相加
        let sum = digit1 + digit2 + carry
        
        // 当前位的结果
        let currentDigit = sum % 10
        
        // 新的进位
        carry = Math.floor(sum / 10)
        
        // 记录计算步骤
        steps.push({
            digit1,
            digit2,
            carry_in,
            sum,
            currentDigit,
            carry_out: carry
        })
        
        // 将当前位的结果添加到结果数组的开头
        result.unshift(currentDigit)
        
        // 移动指针
        i--
        j--
    }
    
    
    // 将结果数组转换为字符串
    return result.join('')
};

let num1 = "11"
let num2 = "123"
console.log(`字符串相加: "${num1}" + "${num2}" = "${addStrings(num1, num2)}"`)
console.log('-----------------------------------\n')


// ============================================
// 🔄 全排列问题
// ============================================
// 输入：nums = [1,2,3]
// 输出：[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]
// 解释：给定一个不含重复数字的数组，返回其所有可能的全排列

/**
 * 核心思想：回溯算法 - 递归构建每一种排列
 * 
 * 算法步骤：
 * 1. 定义一个路径path，记录当前已选择的数字
 * 2. 当path长度等于nums长度时，找到一个完整排列
 * 3. 遍历nums中的每个数字，如果未被使用则加入path，继续递归
 * 4. 递归结束后回溯，尝试其他可能性
 * 
 * @param {number[]} nums
 * @return {number[][]}
 */
var permute = function(nums) {
    const res = []  // 存储所有排列结果
    
    // 回溯函数：path表示当前路径
    const backtrack = (path) => {
        // 递归终止条件：路径长度等于数组长度，找到一个完整排列
        if(path.length === nums.length) {
            res.push(path)
            return
        }
        
        // 遍历所有数字，尝试将每个未使用的数字加入路径
        for(let i = 0; i < nums.length; i++) {
            let n = nums[i]
            // 如果当前数字已经在路径中，跳过
            if(path.includes(n)) {
                continue
            }
            // 递归调用：将当前数字加入路径
            backtrack(path.concat(n))
        }
    }
    
    // 从空路径开始回溯
    backtrack([])
    return res
}

let permNums = [1, 2, 3]
console.log(`全排列: [${permNums}]`)
let permResult = permute(permNums)
console.log('结果:', permResult)
console.log(`共 ${permResult.length} 种排列`)
console.log('-----------------------------------\n')


//反转链表
var reverseList = function(head) {
    let prev = null
    let current = head
    while(current){
        let next = current.next
        current.next = prev
        prev = current
        current = next
    }
    return prev
}
//反转字符串
var reverseString = function(s) {
    let left = 0
    let right = s.length - 1
    while(left < right){
        let temp = s[left]
        s[left] = s[right]
        s[right] = temp
        left++
        right--
    }
    return s
}

//两数之和
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
        var twoSum = function(nums,target){
            let map = new Map();
            for(let i = 0;i<nums.length;i++){
                let n = nums[i]
                let n2 = target-n
                if(map.has(n2)){
                    return [map.get(n2),i]
                }else{
                    map.set(n,i)
                }
            }
        }

//二叉树的层序遍历

/**
 * 输入：root = [3,9,20,null,null,15,7]
 * 输出：[[3],[9,20],[15,7]]
 * 解释：
 * 3
 * / \
 * 9  20
 * /  \
 * 15   7
 * 
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * @param {TreeNode} root
 * @return {number[][]}
 */
var levelOrder = function(root) {
    const ret = [];
    if (!root) {
        return ret;
    }

    const q = [];
  q.push(root);
  //此时q的值为[3]
    while (q.length !== 0) {
        const currentLevelSize = q.length;
        ret.push([]);
        for (let i = 1; i <= currentLevelSize; ++i) {
            const node = q.shift();
            ret[ret.length - 1].push(node.val);
            if (node.left) q.push(node.left);
            if (node.right) q.push(node.right);
        }
    }
        
    return ret;
};


// ============================================
// 📏 最长递增子序列问题
// ============================================
// 输入：nums = [10,9,2,5,3,7,101,18]
// 输出：4
// 解释：最长递增子序列是 [2,3,7,101]，因此长度为 4

/**
 * 核心思想：动态规划 - 记录以每个元素结尾的最长递增子序列长度
 * dp[i]：以 nums[i] 结尾的最长递增子序列的长度
 * 
 * 状态转移方程：
 * dp[i] = max(dp[j] + 1)，其中 j < i 且 nums[j] < nums[i]
 * - 遍历 i 之前的所有元素 j
 * - 如果 nums[j] < nums[i]，说明可以接在 j 后面形成更长的递增子序列
 * - dp[i] 取所有可能情况中的最大值
 */
var lengthOfLIS = function(nums) {
    if(nums.length === 0) return 0
    
    // 初始化：每个元素自己至少构成长度为1的递增子序列
    let dp = new Array(nums.length).fill(1)
    
    // 状态转移：从第1个元素开始遍历
    for(let i = 1; i < nums.length; i++) {
        // 遍历 i 之前的所有元素
        for(let j = 0; j < i; j++) {
            // 如果 nums[j] < nums[i]，可以接在 j 后面
            if(nums[j] < nums[i]) {
                dp[i] = Math.max(dp[i], dp[j] + 1)
            }
        }
    }
    
    console.log('原数组:', nums)
    console.log('dp (以每个元素结尾的LIS长度):', dp)
    
  // 返回 dp 数组中的最大值
    return Math.max(...dp)
};

let lisNums = [10, 9, 2, 5, 3, 7, 101, 18]
console.log('最长递增子序列长度:', lengthOfLIS(lisNums))
console.log('-----------------------------------\n')

// 测试用例2
let lisNums2 = [0, 1, 0, 3, 2, 3]
console.log('测试用例2:', lisNums2)
console.log('最长递增子序列长度:', lengthOfLIS(lisNums2))
console.log('-----------------------------------\n')


//层序遍历二叉树
/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * @param {TreeNode} root
 * @return {number[][]}
 */
var levelOrder = function(root) {
    const ret = [];
    if (!root) {
        return ret;
    }

  const q = [];
  q.push(root);
  //此时q的值为[3]
    while (q.length !== 0) {
        const currentLevelSize = q.length;
        ret.push([]);
        for (let i = 1; i <= currentLevelSize; ++i) {
            const node = q.shift();
            ret[ret.length - 1].push(node.val);
            if (node.left) q.push(node.left);
            if (node.right) q.push(node.right);
        }
    }
        
    return ret;
};

console.log(levelOrder([3, 9, 20, null, null, 15, 7]))


/**
 * 
 * 
 * // 数组表示（题目中看到的）
[3,9,20,null,null,15,7]

// 实际传给你函数的（已转换）
{
  val: 3,
  left: {
    val: 9,
    left: null,
    right: null
  },
  right: {
    val: 20,
    left: { val: 15, left: null, right: null },
    right: { val: 7, left: null, right: null }
  }
}
 */


//二叉树的最大深度
var maxDepth = function(root) {
    max = 0
    const dfs = (r,l)=>{
        if(!r) return ;
        //叶子节点
      if (!r.right && !r.left) {
          //当前叶子节点深度为l，更新最大深度
             max=  Math.max(max,l)
        }
        dfs(r.left,l+1)
        dfs(r.right,l+1)
        
    }
    dfs(root,1)
    return max;
};

console.log("---------------二叉树的中序遍历-----------------")
console.log(maxDepth([3, 9, 20, null, null, 15, 7]))
console.log('-----------------------------------\n')

var inorderTraversal = function (root) { 
  const res = []
  const dfs = (r) => { 
    if(!r) return ;
    dfs(r.left)
    res.push(r.val)
    dfs(r.right)
  }
  dfs(root)
  return res;
}


console.log('--------------------翻转二叉树---------------------')
console.log(inorderTraversal([3, 9, 20, null, null, 15, 7]))

var invertTree = function(root) {
    if (!root) {
        return null;
    }
    const left = invertTree(root.left);
    const right = invertTree(root.right);
    root.left = right;
    root.right = left;
    return root;
};
console.log(invertTree([3, 9, 20, null, null, 15, 7]))


console.log('--------------对称二叉树---------------------\n')

var isSymmetric = function(root) {
    // 100. 相同的树（改成镜像判断）
    function isSameTree(p, q) {
        if (p === null || q === null) {
            return p === q;
        }
        return p.val === q.val && isSameTree(p.left, q.right) && isSameTree(p.right, q.left);
    }
    return isSameTree(root.left, root.right);
};

console.log('--------------相同的树---------------------\n')

var isSameTree = function(p, q) {
    if(p == null && q == null) 
        return true;
    if(p == null || q == null) 
        return false;
    if(p.val != q.val) 
        return false;
    return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
};