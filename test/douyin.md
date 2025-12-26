# 前端面试必备知识点（50个精华）

## 1. 闭包的本质
函数内部可以访问外部函数的变量，即使外部函数已经执行完毕。

## 2. Promise的三种状态
pending（等待）、fulfilled（成功）、rejected（失败）。状态一旦改变就不可逆！记住：then方法返回新Promise，这是链式调用的关键。

## 3. 事件循环EventLoop
同步任务先执行，微任务队列（Promise、MutationObserver）优先于宏任务队列（setTimeout、setInterval）。记住口诀：先同步，再微任务，最后宏任务。

## 4. var/let/const区别
var有变量提升、无块级作用域；let/const有块级作用域、有暂时性死区、不能重复声明；const声明时必须赋值且不能修改引用地址。

## 5. 原型链查找机制
对象找属性时，先找自身，找不到就沿着__proto__往上找，直到Object.prototype。这就是为什么所有对象都能用toString方法。

## 6. this指向四大规则
1.默认绑定指向window 2.隐式绑定看调用者 3.显式绑定用call/apply/bind 4.new绑定指向新对象。箭头函数的this看外层。

## 7. 深拷贝vs浅拷贝
浅拷贝只复制第一层，深拷贝递归复制所有层。JSON.parse(JSON.stringify())不能处理函数、undefined、循环引用。最好用递归或lodash的cloneDeep。

## 8. 防抖debounce原理
连续触发事件，只在最后一次触发后延迟执行。应用场景：搜索框输入、窗口resize。核心代码：clearTimeout清除上次定时器，重新设置新定时器。

## 9. 节流throttle原理
规定时间内只执行一次。应用场景：滚动加载、按钮提交。两种实现：时间戳版本（立即执行）和定时器版本（延迟执行）。

## 10. 跨域解决方案
CORS最常用（后端设置响应头）、JSONP只支持GET、Nginx反向代理、Webpack的proxy、postMessage用于iframe通信。记住同源策略三要素：协议、域名、端口。

## 11. Cookie/LocalStorage/SessionStorage
Cookie有过期时间、4KB限制、每次请求自动携带；LocalStorage永久存储、5MB；SessionStorage页面关闭即清除。面试常考应用场景！

## 12. HTTP缓存机制
强缓存看Expires和Cache-Control；协商缓存看Last-Modified/If-Modified-Since和ETag/If-None-Match。304表示使用缓存，200表示重新获取。

## 13. HTTPS加密过程
客户端请求→服务器返回证书→客户端验证证书→生成随机密钥并用公钥加密→服务器用私钥解密→双方使用对称密钥通信。记住：非对称加密交换密钥，对称加密传输数据。

## 14. TCP三次握手
客户端发SYN→服务器回SYN+ACK→客户端发ACK。为什么三次？防止已失效的连接请求突然到达服务器，避免资源浪费。

## 15. Vue响应式原理
Vue2用Object.defineProperty劫持数据，无法监听数组索引和新增属性；Vue3用Proxy代理整个对象，可监听动态属性。面试高频考点！

## 16. Vue生命周期钩子
beforeCreate→created→beforeMount→mounted→beforeUpdate→updated→beforeDestroy→destroyed。记住：created可访问data，mounted可访问DOM。

## 17. Vue的diff算法
同层比较，不跨层级；key值优化复用；双端比较算法提高效率。头头、尾尾、头尾、尾头四次比较，最后用key建立映射表。

## 18. React的Hooks
useState状态管理、useEffect副作用、useMemo缓存计算、useCallback缓存函数、useRef保存引用。记住：Hooks只能在顶层调用，不能在条件语句中。

## 19. React的Fiber架构
将渲染任务拆分成小单元，可中断和恢复，解决大量更新时页面卡顿。双缓存机制，current树和workInProgress树交替工作。

## 20. 虚拟DOM的优势
减少直接操作真实DOM的次数；跨平台能力（React Native）；diff算法高效更新。但不是绝对快于原生，简单场景下原生更快。

## 21. webpack打包原理
从入口文件开始递归解析依赖，用loader转换模块，用plugin扩展功能，最终输出bundle。记住：loader处理文件，plugin处理流程。

## 22. Tree-shaking原理
基于ES6 Module的静态结构，在编译时就能确定依赖关系。去除未使用的代码。注意：副作用代码会影响tree-shaking，需在package.json中配置sideEffects。

## 23. 懒加载实现方式
图片懒加载：监听scroll+getBoundingClientRect或IntersectionObserver API；路由懒加载：import()动态导入，配合React.lazy或Vue的异步组件。

## 24. 首屏优化策略
路由懒加载、图片懒加载、CDN加速、Gzip压缩、代码分割、骨架屏、SSR服务端渲染、预渲染、减少首屏请求数、资源按需加载。

## 25. 重绘vs重排
重排（回流）：元素位置大小改变，影响布局，开销大；重绘：元素样式改变不影响布局，开销小。减少重排：批量修改DOM、使用transform代替top/left。

## 26. CSS选择器优先级
!important > 行内样式 > ID选择器 > 类选择器 > 标签选择器 > 通配符。计算方式：(a,b,c,d)，a是行内，b是ID数，c是类数，d是标签数。

## 27. BFC块格式化上下文
触发条件：float不为none、position为absolute/fixed、display为inline-block/flex、overflow不为visible。应用：清除浮动、防止margin重叠。

## 28. Flex布局核心属性
容器：justify-content（主轴对齐）、align-items（交叉轴对齐）、flex-direction（方向）；项目：flex-grow（放大）、flex-shrink（缩小）、flex-basis（基准）。

## 29. CSS实现垂直居中
flex布局、grid布局、绝对定位+transform、绝对定位+margin:auto、line-height等于height、table-cell+vertical-align。面试常考！

## 30. 箭头函数与普通函数
箭头函数无this、无arguments、无prototype、不能new、this继承外层。面试重点：箭头函数this不能被call/apply/bind改变。

## 31. async/await原理
基于Generator和Promise的语法糖。await后面的代码相当于Promise.then中的回调。错误捕获用try-catch，比Promise链式调用更清晰。

## 32. ES6模块与CommonJS区别
ES6静态加载、编译时确定依赖、输出值的引用；CommonJS动态加载、运行时确定依赖、输出值的拷贝。ES6用import/export，CommonJS用require/module.exports。

## 33. 数组常用方法汇总
改变原数组：push、pop、shift、unshift、splice、sort、reverse；不改变：map、filter、reduce、slice、concat、forEach。记住：slice截取，splice修改。

## 34. 如何判断数据类型
typeof（基本类型）、instanceof（引用类型）、Object.prototype.toString.call()（最准确）、Array.isArray()（数组专用）、constructor。

## 35. 实现继承的6种方式
原型链继承、构造函数继承、组合继承、原型式继承、寄生式继承、寄生组合式继承（最优）。ES6的class extends本质是寄生组合式继承的语法糖。

## 36. 手写Promise核心代码
三个状态、then方法返回新Promise、resolve/reject改变状态、处理异步回调队列、实现链式调用。面试高频手写题，一定要能写出来！

## 37. 前端安全XSS防御
存储型、反射型、DOM型XSS。防御：输入过滤、输出转义（<转&lt;）、HttpOnly防止Cookie被窃取、CSP内容安全策略。

## 38. 前端安全CSRF防御
跨站请求伪造，利用用户登录态发起恶意请求。防御：验证Token、验证Referer、SameSite Cookie属性、关键操作二次验证。

## 39. 浏览器输入URL全过程
DNS解析→TCP连接→发送HTTP请求→服务器处理→返回响应→浏览器解析HTML→构建DOM树→构建CSSOM树→生成渲染树→布局→绘制。必背！

## 40. 浏览器渲染流程
解析HTML生成DOM树、解析CSS生成CSSOM树、合成渲染树、布局计算位置大小、绘制像素、合成层显示。JS会阻塞DOM解析，CSS会阻塞渲染。

## 41. 前端性能监控指标
FCP首次内容绘制、LCP最大内容绘制、FID首次输入延迟、CLS累积布局偏移、TTI可交互时间。使用Performance API和Lighthouse工具检测。

## 42. Webpack优化策略
代码分割、Tree-shaking、压缩代码、CDN加速、持久化缓存、多线程打包（thread-loader）、DllPlugin预编译、合理配置source-map。

## 43. 内存泄漏常见场景
未清理定时器、未解绑事件监听、闭包引用、全局变量滥用、被遗忘的console.log。记住：及时清理，removeEventListener、clearTimeout。

## 44. GET与POST区别
GET参数在URL、有长度限制、可缓存、幂等；POST参数在请求体、无长度限制、不可缓存、非幂等。本质上都是TCP连接，区别是语义和规范。

## 45. RESTful API设计
GET查询、POST创建、PUT更新、DELETE删除、PATCH部分更新。URL用名词复数，返回状态码清晰（200成功、404未找到、500服务器错误）。

## 46. 前端工程化完整链路
脚手架初始化→编码规范（ESLint/Prettier）→Git提交规范（commitlint）→打包构建（Webpack/Vite）→自动化测试→CI/CD部署→性能监控。

## 47. Vite为什么快
开发环境用ES Module原生支持，无需打包；使用esbuild预构建依赖（Go语言编写）；HMR热更新只更新改变的模块。生产环境仍用Rollup打包。

## 48. 前端常用设计模式
单例模式（Vuex）、工厂模式（createElement）、观察者模式（EventBus）、发布订阅模式（Vue响应式）、代理模式（Proxy）、策略模式（表单验证）。

## 49. 移动端适配方案
viewport+rem、vw/vh、flexbox弹性布局、媒体查询、1px边框问题（transform:scale(0.5)）、图片2x/3x适配、安全区域适配（iPhone刘海屏）。

## 50. 前端监控体系
性能监控（Performance API）、错误监控（window.onerror、unhandledrejection）、行为监控（埋点）、白屏监控、接口监控、资源加载监控。上报用Image或sendBeacon。

---

**每个知识点都是面试高频考点，建议收藏反复查看！💪**








