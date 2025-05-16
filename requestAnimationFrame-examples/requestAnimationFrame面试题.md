# requestAnimationFrame 面试题集锦

## 基础概念题

### 1. 什么是 requestAnimationFrame？

requestAnimationFrame 是浏览器提供的一个用于优化动画效果的 API。它会告诉浏览器你希望执行一个动画，并请求浏览器在下一次重绘之前调用指定的回调函数来更新动画。这个方法需要传入一个回调函数作为参数，该回调函数会在浏览器下一次重绘之前执行。

### 2. requestAnimationFrame 与 setTimeout/setInterval 的区别？

- **执行时机**：requestAnimationFrame 与浏览器重绘频率同步，通常是 60fps（每秒60帧），而 setTimeout/setInterval 可能不准确。
- **性能优化**：当页面不可见或在后台标签时，requestAnimationFrame 会自动暂停，节省 CPU、GPU 和电池资源。
- **精确度**：setTimeout/setInterval 的执行时间可能会受到其他任务的影响而延迟，而 requestAnimationFrame 更为精确。
- **帧率适应**：requestAnimationFrame 会自动适应显示器的刷新率，提供更平滑的动画体验。

### 3. requestAnimationFrame 的返回值是什么？如何取消它？

requestAnimationFrame 返回一个整数，表示请求的 ID。可以使用 `cancelAnimationFrame(id)` 来取消这个回调函数的执行。

```javascript
const animationId = requestAnimationFrame(callback);
// 在需要时取消动画
cancelAnimationFrame(animationId);
```

## 进阶概念题

### 4. 如何使用 requestAnimationFrame 实现平滑动画？

要实现平滑动画，需要在回调函数内再次调用 requestAnimationFrame 形成递归，同时计算当前时间来调整动画进度：

```javascript
let start = null;
const duration = 1000; // 动画持续1秒

function animate(timestamp) {
  if (!start) start = timestamp;
  const progress = (timestamp - start) / duration;
  
  if (progress < 1) {
    // 继续动画
    requestAnimationFrame(animate);
  }
}

requestAnimationFrame(animate);
```

### 5. requestAnimationFrame 如何处理高分辨率显示器（高 DPI）？

requestAnimationFrame 自动适应显示器的刷新率，无需额外处理高 DPI 显示器。但在处理绘图时，需要考虑设备像素比 `window.devicePixelRatio` 来确保清晰度。

### 6. requestAnimationFrame 的回调函数接收什么参数？

回调函数接收一个参数，表示当前被调用的时间戳（DOMHighResTimeStamp），可用于计算动画的进度。

```javascript
function animate(timestamp) {
  console.log(`当前时间戳: ${timestamp}`);
  requestAnimationFrame(animate);
}
```

## 实战应用题

### 7. 如何使用 requestAnimationFrame 实现节流（throttle）？

可以使用 requestAnimationFrame 代替传统的时间间隔来实现更高效的节流：

```javascript
function throttleRAF(callback) {
  let ticking = false;
  
  return function(...args) {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(() => {
        callback(...args);
        ticking = false;
      });
    }
  };
}

// 使用示例
const throttledScroll = throttleRAF(() => console.log('滚动事件节流处理'));
window.addEventListener('scroll', throttledScroll);
```

### 8. 在 React 中如何正确使用 requestAnimationFrame？

在 React 中使用 requestAnimationFrame 时，需要考虑组件的生命周期，确保在组件卸载时取消动画：

```jsx
import React, { useEffect, useRef } from 'react';

function AnimatedComponent() {
  const rafRef = useRef(null);
  
  useEffect(() => {
    function animate() {
      // 动画逻辑
      rafRef.current = requestAnimationFrame(animate);
    }
    
    rafRef.current = requestAnimationFrame(animate);
    
    // 清理函数
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);
  
  return <div>动画组件</div>;
}
```

### 9. 如何解决 requestAnimationFrame 在不同设备上的帧率差异问题？

可以基于时间而不是帧数来计算动画的进度，这样可以在不同帧率的设备上保持一致的动画速度：

```javascript
let lastTime = 0;
const speed = 100; // 每秒移动100像素

function animate(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const elapsed = timestamp - lastTime;
  lastTime = timestamp;
  
  // 基于实际经过的时间计算移动距离
  const pixelsToMove = (speed * elapsed) / 1000;
  
  // 更新元素位置
  element.style.left = `${parseFloat(element.style.left || 0) + pixelsToMove}px`;
  
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
```

### 10. 在 Canvas 动画中如何正确使用 requestAnimationFrame？

在 Canvas 动画中，应该在每一帧清除画布并重新绘制，同时使用 requestAnimationFrame 来保持动画流畅：

```javascript
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
let x = 0;

function draw(timestamp) {
  // 清除画布
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 绘制新的一帧
  ctx.beginPath();
  ctx.arc(x, 100, 20, 0, Math.PI * 2);
  ctx.fill();
  
  // 更新位置
  x = (x + 1) % canvas.width;
  
  // 请求下一帧
  requestAnimationFrame(draw);
}

requestAnimationFrame(draw);
```

## 性能优化题

### 11. 如何优化使用 requestAnimationFrame 的性能？

优化性能的几种方法：
- 减少每帧执行的计算量
- 使用离屏 Canvas 进行预渲染
- 在不可见时暂停动画
- 使用 Web Workers 进行复杂计算
- 利用 GPU 加速（transform, opacity 等属性）
- 使用时间差来平滑动画，而不是固定的位移

### 12. 如何检测 requestAnimationFrame 的实际帧率？

可以通过计算连续调用之间的时间间隔来检测实际帧率：

```javascript
let frameCount = 0;
let lastTime = performance.now();
let fps = 0;

function checkFPS(timestamp) {
  frameCount++;
  
  if (timestamp - lastTime >= 1000) {
    fps = frameCount;
    frameCount = 0;
    lastTime = timestamp;
    console.log(`当前帧率: ${fps} FPS`);
  }
  
  requestAnimationFrame(checkFPS);
}

requestAnimationFrame(checkFPS);
```

### 13. 如何使用 requestAnimationFrame 实现平滑的页面滚动？

```javascript
function smoothScrollTo(targetY, duration = 500) {
  const startY = window.scrollY;
  const difference = targetY - startY;
  let startTime = null;
  
  function scroll(timestamp) {
    if (!startTime) startTime = timestamp;
    
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeInOutCubic = progress < 0.5
      ? 4 * progress ** 3
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    
    window.scrollTo(0, startY + difference * easeInOutCubic);
    
    if (elapsed < duration) {
      requestAnimationFrame(scroll);
    }
  }
  
  requestAnimationFrame(scroll);
}

// 使用示例
document.querySelector('.scroll-button').addEventListener('click', () => {
  smoothScrollTo(1000); // 滚动到距离顶部1000px的位置
});
```

## 兼容性和工程实践题

### 14. requestAnimationFrame 的浏览器兼容性如何？如何做兼容处理？

requestAnimationFrame 在现代浏览器中都得到了良好支持，但对于旧浏览器需要使用前缀或回退到 setTimeout：

```javascript
// 兼容性处理
window.requestAnimationFrame = (function() {
  return window.requestAnimationFrame ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame ||
         window.msRequestAnimationFrame ||
         function(callback) {
           window.setTimeout(callback, 1000 / 60);
         };
})();

window.cancelAnimationFrame = (function() {
  return window.cancelAnimationFrame ||
         window.webkitCancelAnimationFrame ||
         window.mozCancelAnimationFrame ||
         window.msCancelAnimationFrame ||
         function(id) {
           window.clearTimeout(id);
         };
})();
```

### 15. 什么场景下不应该使用 requestAnimationFrame？

不适合使用 requestAnimationFrame 的场景：
- 需要精确定时器的场景（如游戏中的倒计时）
- 需要在后台标签页继续运行的场景
- 简单的一次性动画（可以使用 CSS 过渡或动画）
- 复杂的数据处理（应该使用 Web Workers） 