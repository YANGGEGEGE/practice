console.log('--------------反转链表---------------------\n')
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
console.log(reverseList([1,2,3,4,5]))
console.log('-----------------------------------\n')


console.log('--------------环形链表---------------------\n')

var hasCycle = function(head) {
    let p1 = head
    let p2 = head 
    while(p1&&p2&&p2.next){
        p1 = p1.next 
        p2 = p2.next.next
        if(p1==p2){
            return true
        }
        
    }
    return false
};


console.log('合并两个有两个有序链表---------------------\n')
var mergeTwoLists = function (l1, l2) {
   let cur = new ListNode();
    let dummy = cur

    while(l1!=null&&l2!=null){
        if(l1.val<l2.val){
            cur.next = l1
            l1 = l1.next
        }else{
            cur.next = l2
            l2 = l2.next
        }
        cur = cur.next


    }
    if(l1!=null){
        cur.next = l1
    }else{
        cur.next = l2
    }

    return dummy.next

};

console.log('--------------删除链表中倒数第n个节点---------------------\n')
var removeNthFromEnd = function(head, n) {
    //要记住时刻的创建dummy节点
    let dummy = new ListNode()
    dummy.next = head
    l1 = dummy
    l2= dummy
    step = 0 
    while ( step < n){
        l2 = l2.next
        step++
    }
    while(l2.next!=null){
        l1 = l1.next
        l2=l2.next
    }
    l1.next = l1.next.next
    return dummy.next
};

