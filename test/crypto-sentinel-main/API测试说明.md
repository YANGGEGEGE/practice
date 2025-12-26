# API 测试说明

## 问题诊断

当前前端显示：
- ❌ 当前价格显示 "加载中..." (价格为 0)
- ❌ 持仓价值为 $0.00
- ❌ 未实现盈亏为 $0.00

## 已修复的问题

1. ✅ 持仓方向显示"无持仓"已改为"已抵消"
2. ✅ 后端改用 `/fapi/v2/positionRisk` 接口获取持仓（包含正确的 markPrice）
3. ✅ 添加了详细的日志用于调试

## 测试步骤

### 方法1：测试币安API（推荐先做）

如果你想直接测试币安API是否返回正确数据：

```bash
cd /Users/qiuzhiyang/Desktop/bn/crypto-sentinel

# 确保设置了环境变量
export BINANCE_API_KEY="your_api_key"
export BINANCE_SECRET_KEY="your_secret_key"

# 运行测试脚本
node test-futures-api.js
```

这个脚本会显示：
- 账户信息（余额、保证金等）
- 持仓详情（包括 markPrice）
- 每个接口返回的原始数据

### 方法2：测试后端API

启动后端后，运行：

```bash
cd /Users/qiuzhiyang/Desktop/bn/crypto-sentinel
./test-api.sh
```

或者手动测试：

```bash
# 测试合约分析接口
curl http://localhost:3000/monitor/futures/analytics | jq '.'

# 测试持仓接口
curl http://localhost:3000/monitor/futures/positions | jq '.'
```

### 方法3：查看后端日志

启动后端时，现在会输出详细日志：

```bash
cd apps/backend
pnpm run start:dev
```

查找日志中的关键信息：
- `📊 Position Summary:` - 持仓摘要
- `⚠️ markPrice is 0` - 如果看到这个，说明 markPrice 为空
- 每个持仓的详细信息（symbol, price, netValue, PnL）

## 预期结果

正确的返回数据应该是：

```json
{
  "success": true,
  "totalBalance": 3440.77,
  "totalPnl": 40.11,
  "positionCount": 12,
  "positions": [
    {
      "symbol": "DOTUSDT",
      "netPosition": 600,
      "netValue": 2400.50,
      "pnl": 45.20,
      "price": 4.00,  // ⚠️ 这个不应该是 0
      "leverage": 14
    }
  ]
}
```

## 常见问题

### Q1: price 字段为 0

**可能原因：**
1. 币安API配置错误（API Key 或 Secret Key）
2. 网络问题（需要代理访问币安API）
3. 币安API返回的数据中 markPrice 字段为空

**解决方法：**
1. 检查 `apps/backend/.env` 文件中的 API 配置
2. 确保设置了代理（如果需要）：`export https_proxy=http://127.0.0.1:7890`
3. 运行测试脚本查看原始返回数据

### Q2: 持仓价值为 0

持仓价值 = 净持仓量 × 当前价格

如果当前价格为 0，持仓价值也会是 0。先解决价格问题。

### Q3: 未实现盈亏为 0

未实现盈亏直接来自币安API的 `unRealizedProfit` 字段。
如果你的账户确实没有盈亏，显示 0 是正常的。

## 下一步

1. 先运行 `node test-futures-api.js` 测试币安API
2. 检查是否能正确获取 markPrice
3. 如果币安API返回正确，但后端还是显示0，查看后端日志
4. 把测试结果发给我，我会根据实际情况进一步修复

## 代码改动说明

### 后端改动：

**`futures-analytics.service.ts`**
- 改用 `getPositions()` 获取持仓（调用 `/fapi/v2/positionRisk` 接口）
- 添加详细日志输出
- 检测并警告 markPrice 为 0 的情况

**`binance-futures.service.ts`**
- `getAccountInfo()` 添加了缺失的字段
- `getPositions()` 使用 `/fapi/v2/positionRisk` 接口（有正确的 markPrice）

### 前端改动：

**`FuturesPositions.tsx`**
- "无持仓" 改为 "已抵消"
- 当价格为 0 时显示 "加载中..."

**`Dashboard/index.tsx`**
- 优化布局，合约持仓区域全宽显示
- 移除未使用的代码

