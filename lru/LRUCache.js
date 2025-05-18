/**
 * @param {number} capacity
 */
var LRUCache = function(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
};

/** 
 * @param {number} key
 * @return {number}
 */
LRUCache.prototype.get = function(key) {
    if (!this.cache.has(key)) {
        return -1;
    }
    
    // 获取值
    const value = this.cache.get(key);
    // 从缓存中删除，再重新插入，使其成为最近使用的
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
};

/** 
 * @param {number} key 
 * @param {number} value
 * @return {void}
 */
LRUCache.prototype.put = function(key, value) {
    // 如果键已存在，先删除，以便更新其位置（变为最近使用）
    if (this.cache.has(key)) {
        this.cache.delete(key);
    }
    
    // 插入新的或更新的键值对
    this.cache.set(key, value);
    
    // 如果超出容量，则淘汰最久未使用的
    if (this.cache.size > this.capacity) {
        // Map.keys() 返回一个迭代器，next().value 获取第一个键（即最早插入的）
        const oldestKey = this.cache.keys().next().value;
        this.cache.delete(oldestKey);
    }
};

/** 
 * Your LRUCache object will be instantiated and called as such:
 * var obj = new LRUCache(capacity)
 * var param_1 = obj.get(key)
 * obj.put(key,value)
 */

// 示例用法，你可以复制到 LeetCode 或本地测试
if (require.main === module) {
    console.log("LeetCode LRU 缓存示例:");
    const lRUCache = new LRUCache(2);
    console.log("put(1, 1)");
    lRUCache.put(1, 1); // 缓存是 {1=1}
    // 辅助打印当前缓存状态
    // console.log(Array.from(lRUCache.cache.entries())); 

    console.log("put(2, 2)");
    lRUCache.put(2, 2); // 缓存是 {1=1, 2=2}
    // console.log(Array.from(lRUCache.cache.entries()));

    console.log("get(1)", "->", lRUCache.get(1));    // 返回 1
    // console.log(Array.from(lRUCache.cache.entries()));

    console.log("put(3, 3)");
    lRUCache.put(3, 3); // 该操作会使得关键字 2 作废，缓存是 {1=1, 3=3}
    // console.log(Array.from(lRUCache.cache.entries()));

    console.log("get(2)", "->", lRUCache.get(2));    // 返回 -1 (未找到)
    // console.log(Array.from(lRUCache.cache.entries()));

    console.log("put(4, 4)");
    lRUCache.put(4, 4); // 该操作会使得关键字 1 作废，缓存是 {4=4, 3=3} (更正：应该是 {3=3, 4=4} 因为3是put(3,3)后get(1)时被移到前面的，然后put(4,4)时1被删，4加到后面)
                                // 经过实际测试和Map的特性，put(3,3)后1=1在前面，3=3在后面。get(1)后，2=2在前面，1=1在后面。
                                // put(3,3)后，key 2被删除，cache是{1=1, 3=3} (1在Map中更早，3更新)
                                // LeetCode 示例的缓存状态 {4=4, 3=3} 是基于 put(4,4) 后，3=3 是上一步操作（put(3,3)）留下的，且未被访问，而 4=4 是新插入的。
                                // 关键在于 Map 保持插入顺序，get 操作会将被访问的元素重新插入到末尾。
    // console.log(Array.from(lRUCache.cache.entries()));

    console.log("get(1)", "->", lRUCache.get(1));    // 返回 -1 (未找到)
    // console.log(Array.from(lRUCache.cache.entries()));

    console.log("get(3)", "->", lRUCache.get(3));    // 返回 3
    // console.log(Array.from(lRUCache.cache.entries()));

    console.log("get(4)", "->", lRUCache.get(4));    // 返回 4
    // console.log(Array.from(lRUCache.cache.entries()));

    console.log("\n另一个测试案例:");
    const cache2 = new LRUCache(1);
    cache2.put(2,1);
    console.log("put(2,1)"); // cache: {2=1}
    // console.log(Array.from(cache2.cache.entries()));
    console.log("get(2)", "->", cache2.get(2)); // cache: {2=1}, returns 1
    // console.log(Array.from(cache2.cache.entries()));
    cache2.put(3,2);
    console.log("put(3,2)"); // cache: {3=2} (2被淘汰)
    // console.log(Array.from(cache2.cache.entries()));
    console.log("get(2)", "->", cache2.get(2)); // cache: {3=2}, returns -1
    // console.log(Array.from(cache2.cache.entries()));
    console.log("get(3)", "->", cache2.get(3)); // cache: {3=2}, returns 2
    // console.log(Array.from(cache2.cache.entries()));
}

// 如果你想在其他文件中作为模块导入这个类:
// module.exports = LRUCache; 