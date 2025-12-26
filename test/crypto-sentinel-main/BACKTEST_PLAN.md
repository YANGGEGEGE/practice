# 比特币量化回测系统开发计划

> **版本 v1.2** | 最后更新：2025-10-15  
> **重要更新**: 新增空投猎人（撸羊毛）自动化系统完整方案

## 🆕 v1.2 核心更新（重要！）

本次更新新增空投猎人系统开发计划：

✅ **空投猎人科普** → 详细原理、案例分析（Arbitrum单钱包$1800）  
✅ **多钱包管理** → HD钱包方案，100钱包自动化  
✅ **Gas费优化** → Layer2优先策略，成本降低90%+  
✅ **反女巫攻击** → 5种随机化策略，避免被项目方识别  
✅ **AI项目评分** → DeepSeek智能筛选高潜力项目  
✅ **预期ROI** → 9倍-39倍回报（保守-乐观）

详见文档"空投猎人系统开发计划"章节

---

## 🆕 v1.1 核心更新

数据源方案优化：

✅ **经济日历数据** → 使用 **AKShare**（免费，包含金十数据）  
✅ **Twitter监控** → 使用 **Nitter RSS**（完全免费，无需$100/月的API）  
✅ **事件筛选规则** → 5条自动化规则 + 历史事件数据库  
✅ **总成本** → **$0/月**（原计划需$100+/月）

---

## 📋 项目概述

构建一个基于Python的量化回测系统，集成DeepSeek AI进行智能分析，结合现有的NestJS监控系统，验证多种交易策略的有效性。

---

## 🎯 技术方案

### 核心架构：Python + NestJS混合架构

```
┌─────────────────────────────────────────────────────────────┐
│                     NestJS Backend (现有)                    │
│  - Binance实时数据接收                                       │
│  - MySQL数据存储                                             │
│  - HTTP API提供历史数据                                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   Python回测引擎 (新增)                      │
│  - backtesting.py / vectorbt                                │
│  - 策略实现与参数优化                                        │
│  - DeepSeek API集成                                          │
│  - 性能分析与可视化                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚙️ 核心配置参数

### 交易参数
- **时间周期**: 5-10分钟K线（适合短线波动策略）
- **历史数据范围**: 2022-2024年（至少2年，覆盖牛熊市）
- **交易对**: BTC/USDT（后续可扩展）
- **止损止盈比**: 1:3（止损1%，止盈3%）
- **手续费**: 0.1%（币安现货Maker/Taker）

### AI配置
- **API提供商**: DeepSeek API
- **应用场景**: 
  - 新闻情绪分析
  - X博主言论分析
  - 重大事件影响评估

---

## 💾 数据存储方案：MySQL集成

### 是否集成到MySQL？建议：**是**

#### ✅ 优点
1. **统一数据源**
   - 回测和实时监控使用同一套数据
   - 避免数据不一致问题
   
2. **便于查询和管理**
   - SQL查询比文件操作灵活
   - 可以按时间范围、指标筛选
   
3. **支持增量更新**
   - 每日只需抓取新数据
   - 节省API调用次数
   
4. **多系统共享**
   - NestJS和Python都能访问
   - 后续扩展方便（前端展示、监控等）

5. **数据完整性**
   - 事务支持，保证数据一致性
   - 索引加速查询

#### ❌ 缺点
1. **额外存储成本**
   - 5分钟K线，1年约10万条记录
   - 但相对较小（约100MB/年）

2. **查询性能**
   - 大批量数据读取稍慢于内存
   - 但可通过索引优化

3. **维护成本**
   - 需要定期清理旧数据
   - 但可以自动化

#### 📊 数据表设计

```sql
-- 历史K线数据表
CREATE TABLE kline_history (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  symbol VARCHAR(20) NOT NULL,              -- 交易对，如 BTCUSDT
  interval_type VARCHAR(10) NOT NULL,       -- 时间周期，如 5m, 10m, 1h
  open_time BIGINT NOT NULL,                -- 开盘时间戳
  open_price DECIMAL(20,8) NOT NULL,        -- 开盘价
  high_price DECIMAL(20,8) NOT NULL,        -- 最高价
  low_price DECIMAL(20,8) NOT NULL,         -- 最低价
  close_price DECIMAL(20,8) NOT NULL,       -- 收盘价
  volume DECIMAL(20,8) NOT NULL,            -- 成交量
  close_time BIGINT NOT NULL,               -- 收盘时间戳
  quote_volume DECIMAL(20,8),               -- 成交额
  trades_count INT,                         -- 成交笔数
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_symbol_interval_time (symbol, interval_type, open_time),
  UNIQUE KEY uk_symbol_interval_time (symbol, interval_type, open_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='历史K线数据';

-- AI分析结果表（新闻/X言论）
CREATE TABLE ai_analysis (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  source_type VARCHAR(20) NOT NULL,         -- 来源类型: news, twitter, reddit
  source_url TEXT,                          -- 来源链接
  content TEXT NOT NULL,                    -- 原始内容
  sentiment_score DECIMAL(3,2),             -- 情绪分数 -1.00 到 1.00
  impact_level VARCHAR(20),                 -- 影响等级: low, medium, high
  ai_summary TEXT,                          -- AI总结
  publish_time BIGINT NOT NULL,             -- 发布时间戳
  analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_publish_time (publish_time),
  INDEX idx_sentiment (sentiment_score)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI情绪分析结果';

-- 重大事件表
CREATE TABLE major_events (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  event_type VARCHAR(50) NOT NULL,          -- 事件类型
  title VARCHAR(255) NOT NULL,              -- 事件标题
  description TEXT,                         -- 事件描述
  event_time BIGINT NOT NULL,               -- 事件发生时间
  impact_score DECIMAL(3,2),                -- 影响分数
  price_change_1h DECIMAL(10,4),            -- 1小时后价格变化%
  price_change_24h DECIMAL(10,4),           -- 24小时后价格变化%
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_event_time (event_time),
  INDEX idx_type (event_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='重大市场事件';
```

**结论：强烈建议集成MySQL，利大于弊**

---

## 📈 核心指标解释

### 什么是夏普比率（Sharpe Ratio）？

**定义**: 衡量策略**收益与风险**比的关键指标

```
夏普比率 = (策略年化收益率 - 无风险利率) / 策略收益波动率
```

#### 通俗解释
- 你赚了10%，但每天心脏病发作一次 → 夏普比率低
- 你赚了10%，而且稳定得像定期存款 → 夏普比率高

#### 评判标准
- **< 0**: 策略亏损，不如不做
- **0-1**: 收益不理想，风险大
- **1-2**: 可接受，中等风险收益比
- **2-3**: 优秀，风险可控收益稳定
- **> 3**: 卓越，罕见（可能过拟合）

#### 示例对比
```
策略A: 年化收益50%，但单日最大亏损20% → 夏普1.2
策略B: 年化收益30%，但单日最大亏损5%  → 夏普2.5
```
**策略B更好**，虽然赚得少但风险低，长期更稳定

#### 其他关键指标
1. **最大回撤（Max Drawdown）**: 从最高点到最低点的亏损幅度
2. **胜率（Win Rate）**: 盈利交易占比
3. **盈亏比（Profit Factor）**: 总盈利 / 总亏损
4. **年化收益率（Annual Return）**: 平均每年收益

---

## 📰 重大事件数据来源

### ⭐ 推荐数据源组合（最终方案）

```
经济日历数据（未来事件预警）:
  首选: AKShare - 免费，数据来自金十数据，开源稳定
  备选: Trading Economics API - $60/月，全球196国数据
  
实时新闻:
  首选: CryptoPanic API - 免费100次/天，加密货币专用
  备选: NewsAPI - $60/月，通用新闻聚合
  
Twitter/X监控:
  首选: Nitter RSS - 完全免费，无需API Key
  备选: snscrape爬虫 - 免费但需代理
  
历史交易数据:
  主力: Binance API - 免费
  存储: MySQL - 本项目已有
```

**总成本**: $0/月（免费方案）或 $60/月（专业方案）

---

### 1. 经济日历API（支持"未来事件"）

#### ⭐⭐⭐ AKShare（强烈推荐，免费）

**为什么选择AKShare？**
- ✅ **完全免费开源** - Python财经数据接口库
- ✅ **包含金十数据日历** - 就是你截图里看到的那个
- ✅ **支持未来事件查询** - 可以提前看到CPI、非农等发布时间
- ✅ **维护活跃** - GitHub 10k+ stars
- ✅ **数据全面** - 中美经济数据、A股、期货、加密货币
- ✅ **无需注册API Key** - 直接pip install使用

**覆盖数据：**
- 中国宏观日历：CPI、PMI、GDP、M2等（对应你截图的金十日历）
- 美国数据：非农、FOMC、CPI等
- 实时更新，数据来源可靠

**使用场景：**
- 获取未来7-30天的重要经济数据发布时间
- 提前布局，在数据发布前调整仓位
- 历史数据回测（分析数据发布后的价格反应）

**局限性：**
- 国际数据不如Trading Economics全面
- 偶尔需要更新版本（维护方会调整）

---

#### Trading Economics API（备选，专业级）

**适用场景：需要全球经济日历**

**优势：**
- ✅ 覆盖196个国家的经济数据
- ✅ 官方API，稳定性高
- ✅ 提供重要性评级（1-3星）
- ✅ 包含预期值、前值、实际值
- ✅ 未来3个月日历

**费用：**
- 免费版：1000次/月（测试够用）
- Guest: $60/月，30000次/月（推荐）
- Historical: $500/月，无限次

**是否需要：**
- 如果只关注中美市场 → **不需要，用AKShare**
- 如果需要欧洲、日本等数据 → **考虑订阅**

---

### 2. 宏观经济事件（补充说明）

#### 美联储利率决议
- **来源**: [Federal Reserve官网](https://www.federalreserve.gov/newsevents/calendar.htm)
- **通过AKShare获取**: 免费，包含在宏观日历中
- **通过FRED API获取**: 只能获取历史利率数据，无法提前知道会议时间
- **频率**: 每年8次FOMC会议
- **影响**: 极高，直接影响全球流动性，BTC通常剧烈波动

#### 美国CPI/PPI数据
- **来源**: [美国劳工统计局](https://www.bls.gov/cpi/)
- **通过AKShare获取**: 包含发布日历
- **通过FRED API获取**: 只能获取历史数据
- **频率**: 每月一次
- **影响**: 高，影响通胀预期和美联储决策

### 3. 加密货币特定事件

#### 交易所暴雷/黑客事件
- **来源**: 
  - [CoinDesk](https://www.coindesk.com/) - 主流媒体
  - [Cointelegraph](https://cointelegraph.com/) - 快讯
  - [CryptoSlate](https://cryptoslate.com/) - 事件聚合
- **推荐API**: 
  - **CryptoPanic API** (免费，加密货币专用) ⭐⭐⭐
  - NewsAPI (需付费 $60/月)
  - RSS订阅（免费但需自己解析）

#### 重大升级/硬分叉
- **来源**: 各公链官方Twitter/博客
- **追踪对象**: 
  - Bitcoin Core GitHub
  - 以太坊官方博客

#### 监管政策
- **来源**: 
  - SEC官网（美国）
  - 各国央行公告

### 4. 推荐的事件聚合平台

#### ⭐⭐⭐ CryptoPanic API（强烈推荐，免费）

**为什么推荐：**
- ✅ 免费额度：100次/天（足够用）
- ✅ 专注加密货币新闻
- ✅ 已分类打标签（bullish/bearish/important）
- ✅ 社区投票的重要性评分
- ✅ 支持过滤币种、来源

**覆盖内容：**
- Twitter热点
- 新闻媒体报道
- Reddit讨论
- 政府监管公告

**使用场景：**
- 实时监控BTC重大新闻
- 自动抓取"important"标签的新闻
- 发送给DeepSeek分析影响

**注册地址：** https://cryptopanic.com/developers/api/

---

#### Messari API（专业级，可选）

**适用场景：需要深度基本面分析**

**优势：**
- ✅ 免费额度：20次/分钟
- ✅ 项目基本面数据
- ✅ 链上数据分析
- ✅ 市场数据聚合
- ✅ 治理事件追踪

**是否需要：**
- 短期交易（5-10分钟级别）→ **不需要**
- 基本面分析、长期投资 → **考虑使用**

### 5. 事件重要性筛选（自动化判断）

#### ⭐⭐⭐ 高重要性（必须关注）

**美国宏观数据：**
1. **FOMC利率决议** 
   - 直接决定全球流动性
   - BTC通常波动 ±5-10%
   - 每年8次，提前45天公布时间
   
2. **非农就业数据（NFP）** 
   - 每月第一个周五 8:30 ET
   - 影响美联储利率预期
   - 常引发短期剧烈波动
   
3. **CPI/PPI通胀数据** 
   - 每月中旬发布
   - 直接影响利率走向
   - 近两年最关键指标
   
4. **GDP数据** 
   - 季度发布
   - 经济衰退/繁荣指标
   
5. **美联储主席讲话** 
   - 鲍威尔每句话都影响市场
   - 关注"鹰派/鸽派"表态

**中国宏观数据：**
1. **CPI/PPI** - 通胀情况（如你截图）
2. **GDP** - 经济增速
3. **制造业PMI** - 经济景气度
4. **M2货币供应** - 流动性指标

**加密货币特定事件：**
1. **BTC ETF相关** - SEC批准/拒绝
2. **交易所重大事件** - 如FTX破产级别
3. **监管诉讼** - SEC起诉主要交易所
4. **比特币减半** - 4年一次
5. **主要国家监管政策** - 如中国禁令、美国法案

#### ⭐⭐ 中等重要性
- 零售销售数据
- 工业产出
- 消费者信心指数
- 二线交易所公告

#### ⭐ 低重要性
- 二线经济体数据（除中美欧日）
- 非官方机构预测
- 小型项目新闻

---

#### 自动筛选规则（建议逻辑）

**规则1：关键词匹配**
```
高优先级关键词：
  宏观: FOMC, Fed, 美联储, 利率, CPI, 非农, NFP, GDP, Powell, 鲍威尔
  加密: SEC, ETF, Binance, Coinbase, 减半, halving, regulation, 监管
  事件: 暴雷, 破产, hack, 黑客, ban, 禁令
```

**规则2：国家/来源过滤**
```
优先级1: 美国、中国
优先级2: 欧盟、日本、英国
优先级3: 其他
```

**规则3：重要性评级**
```
如果数据源提供评级（如Trading Economics的3星）：
  - 3星 + 优先级1国家 → 高重要性
  - 2星以上 + 加密关键词 → 高重要性
  - 其他 → 中低重要性
```

**规则4：历史影响回测**
```
分析历史同类事件对BTC价格的影响：
  - 如果历史上该事件导致 ±3%以上波动 → 标记为重要
  - 建立事件影响数据库，机器学习优化
```

**规则5：AI辅助判断（可选）**
```
将事件标题+描述发给DeepSeek：
  Prompt: "评估以下事件对比特币价格的影响程度（1-5分）和方向（利多/利空）"
  根据AI评分自动归类
```

---

### 6. 历史重大事件手动整理（2022-2024）

**可以先手动整理核心事件作为训练集：**

#### 2022年（熊市）
- **2022.05** - Luna/UST崩盘 → BTC -30%（系统性风险）
- **2022.06** - 三箭资本破产 → BTC -15%（机构暴雷）
- **2022.11** - FTX破产 → BTC -20%（行业信任危机）
- **2022全年** - 美联储激进加息7次 → BTC全年 -65%

#### 2023年（复苏）
- **2023.03** - 硅谷银行暴雷 → BTC +30%（避险需求+美联储放缓加息）
- **2023.06** - SEC起诉Binance和Coinbase → BTC -10%（监管风险）
- **2023.10** - 贝莱德提交BTC现货ETF申请 → 开启牛市
- **2023.12** - 美联储暗示停止加息 → BTC +15%

#### 2024年（牛市）
- **2024.01** - BTC现货ETF通过 → BTC +50%（机构资金入场）
- **2024.04** - BTC第四次减半 → 价格整固后续涨
- **2024.06** - 以太坊ETF通过 → 行业利好

**这些历史事件可用于：**
1. 训练事件影响模型
2. 回测事件驱动策略
3. 建立事件-价格反应数据库

---

## 🎯 待实现的核心策略

### 1. 短期波动策略（优先级★★★★★）

#### 策略逻辑
```
触发条件: 5分钟或10分钟K线涨跌幅 >= 2%

买入信号（反转策略）:
  - 急跌2%后买入（赌反弹）
  - 止损: -1%
  - 止盈: +3%
  
卖出信号（反转策略）:
  - 急涨2%后做空（赌回调）
  - 止损: +1%
  - 止盈: -3%
```

#### 优化方向
- 测试不同阈值: 1.5%, 2%, 2.5%, 3%
- 加入成交量过滤: 成交量突增2倍
- 加入时间过滤: 避开美股开盘时段（波动大但难预测）
- 冷却期: 触发后30分钟内不再交易

### 2. MACD动量策略（优先级★★★★）

```
买入信号:
  - MACD线上穿信号线（金叉）
  - 且MACD柱状图由负转正
  
卖出信号:
  - MACD线下穿信号线（死叉）
  - 或价格达到止盈/止损
```

### 3. 布林带均值回归（优先级★★★）

```
买入信号:
  - 价格触及下轨（超卖）
  - 且RSI < 30
  
卖出信号:
  - 价格回到中轨
  - 或触及上轨
```

### 4. AI增强策略（优先级★★★★★）

#### 4.1 新闻情绪过滤器

```python
# 伪代码
if 基础策略产生买入信号:
    news_sentiment = get_recent_news_sentiment(last_1_hour)
    
    if news_sentiment < -0.5:  # 极度负面
        跳过本次交易
    elif news_sentiment > 0.5:  # 极度正面
        加大仓位20%
    else:
        正常执行
```

#### 4.2 X博主言论分析

**目标**: 整合你关注的KOL观点，辅助决策

**实现方案对比：**

##### ⭐⭐⭐ 方案1: Nitter RSS（推荐，完全免费）

**为什么推荐：**
- ✅ **完全免费** - 无需API Key，无请求限制
- ✅ **足够你的需求** - 监控几个KOL完全够用
- ✅ **简单易用** - 直接解析RSS feed
- ✅ **实时性好** - 5-10分钟延迟（可接受）

**工作原理：**
- Nitter是Twitter的开源隐私前端
- 提供RSS订阅功能
- 格式：`https://nitter.net/用户名/rss`

**推荐的Nitter实例（多准备几个）：**
```
主力: https://nitter.net
备用1: https://nitter.1d4.us
备用2: https://nitter.kavin.rocks
备用3: https://nitter.privacydev.net
```

**使用策略：**
- 定时（每小时）抓取RSS
- 解析最新推文
- 批量发送给DeepSeek分析情绪
- 存储到MySQL的ai_analysis表

**局限性：**
- Nitter实例偶尔失效（多备几个实例可解决）
- RSS只包含最近推文（通常20-100条）
- 无法获取点赞/转发数（但你不需要）

**成本：** $0/月

---

##### 方案2: snscrape爬虫（免费，备用）

**适用场景：** Nitter全部失效时的备用方案

**优势：**
- ✅ 完全免费
- ✅ 数据详细（包括互动数据）
- ✅ 可获取历史推文

**劣势：**
- ❌ 可能被Twitter封IP（需要代理）
- ❌ 不如RSS稳定
- ❌ 需要定期更新爬虫代码

**是否需要代理：**
- 国内使用：需要代理访问Twitter
- 频繁爬取：建议使用住宅代理（约$30/月）
- 低频监控：免费代理也可以

---

##### 方案3: Twitter API（官方，不推荐）

**2024年价格：**
```
Free tier: 已取消（2023年4月）
Basic: $100/月，10000条推文/月
Pro: $5000/月，100万条推文/月
```

**为什么不推荐：**
- ❌ 太贵了，$100/月只为了监控几个KOL
- ❌ 你的需求用Nitter就能满足
- ❌ Basic tier限制很多

**什么情况下考虑：**
- 需要监控数百个账号
- 需要实时推送（秒级延迟）
- 需要完整的互动数据
- 商业项目，需要官方支持

---

##### 方案4: Apify（付费爬虫服务，折中）

**定价：**
```
免费版: $5免费额度/月
Starter: $49/月
```

**优势：**
- ✅ 比Twitter API便宜
- ✅ 比自己爬虫稳定
- ✅ 有网页界面，易用

**劣势：**
- ❌ 还是要花钱
- ❌ 不如Nitter性价比高

---

#### 最终建议：使用Nitter RSS

**理由：**
1. **符合你的需求** - 只监控你关注的几个KOL
2. **完全免费** - $0成本
3. **足够稳定** - 多准备几个Nitter实例
4. **简单实现** - Python的feedparser库即可

**如果Nitter失效：**
- 短期：切换到其他Nitter实例
- 中期：使用snscrape爬虫（免费）
- 长期：如果做商业化，再考虑付费API

#### X言论分析流程（基于Nitter RSS）

**工作流程：**

**步骤1：定时抓取（每小时）**
```
使用Python feedparser库
遍历你关注的KOL列表
从多个Nitter实例获取RSS
解析最新推文内容
```

**步骤2：数据处理**
```
去重：检查是否已存在（根据推文ID）
过滤：只保留与BTC/加密货币相关的推文
清洗：移除链接、表情符号等噪音
```

**步骤3：AI情绪分析**
```
将推文批量发送给DeepSeek API
Prompt示例：
  "你是一个加密货币分析师。分析以下KOL的推文，
   评估他们对比特币的情绪倾向。
   输出：情绪分数（-1到1，保留2位小数）和核心观点（20字内）
   
   推文1: [内容]
   推文2: [内容]
   ...
   
   输出格式JSON：
   {
     'overall_sentiment': 0.65,
     'tweets': [
       {'id': 1, 'sentiment': 0.8, 'summary': '看涨，ETF资金流入'},
       {'id': 2, 'sentiment': 0.5, 'summary': '中性，等待突破'}
     ]
   }"
```

**步骤4：存储到MySQL**
```
表: ai_analysis
字段: 
  - source_type: 'twitter'
  - source_url: Nitter RSS链接
  - content: 推文原文
  - sentiment_score: DeepSeek返回的分数
  - ai_summary: 核心观点
  - publish_time: 推文时间戳
```

**步骤5：回测应用**
```
策略逻辑：
  if 基础策略产生买入信号:
    recent_sentiment = 获取过去1小时的KOL平均情绪分数
    
    if recent_sentiment > 0.5:  # KOL都看涨
        执行买入，仓位 +20%
    elif recent_sentiment < -0.5:  # KOL都看跌
        跳过本次交易
    else:
        正常仓位买入
```

**监控的KOL建议（你自己的关注列表）：**
```
国际影响力大的：
- @DocumentingBTC - 新闻聚合类
- @glassnode - 链上数据分析
- @CryptoQuant - 数据机构

中文KOL：
- 根据你自己的关注列表添加
- 建议3-5个即可，太多噪音反而干扰
```

#### DeepSeek API配置

```yaml
API地址: https://api.deepseek.com/v1/chat/completions
模型: deepseek-chat
费用: 
  - 输入: ¥1/百万tokens
  - 输出: ¥2/百万tokens
  （远低于GPT-4）

配置文件示例:
DEEPSEEK_API_KEY=sk-xxxxxx
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_MAX_TOKENS=1000
```

---

## 🚀 开发阶段规划

### 阶段一：数据基础建设（预计1周）

#### 1.1 MySQL数据表创建
- [ ] 创建kline_history表
- [ ] 创建ai_analysis表
- [ ] 创建major_events表
- [ ] 创建索引优化查询

#### 1.2 历史数据抓取
- [ ] NestJS实现Binance历史K线API调用
- [ ] 批量下载2022-2024年5分钟和10分钟K线
- [ ] 数据清洗和去重
- [ ] 验证数据完整性

**技术细节**:
```typescript
// apps/backend/src/modules/data/services/historical-data.service.ts

// Binance历史K线API
GET /api/v3/klines
参数:
  symbol: BTCUSDT
  interval: 5m / 10m
  startTime: 开始时间戳
  endTime: 结束时间戳
  limit: 1000 (每次最多1000条)
  
注意: 需要分批获取，每次1000条
```

#### 1.3 数据API接口
- [ ] 创建HTTP API供Python调用
- [ ] 接口：GET /api/data/klines?symbol=BTCUSDT&interval=5m&start=xxx&end=xxx
- [ ] 支持时间范围查询
- [ ] 返回JSON格式K线数据

---

### 阶段二：Python回测引擎（预计1周）

#### 2.1 环境搭建
```bash
# 创建Python虚拟环境
python -m venv venv
source venv/bin/activate

# 安装依赖
pip install backtesting pandas numpy matplotlib ta-lib requests
```

#### 2.2 回测框架选择

**推荐：backtesting.py**

理由：
- 轻量级，学习曲线低
- 内置常用指标（MACD、RSI、布林带）
- 可视化效果好
- 支持参数优化

**目录结构**:
```
sentinel/
├── backtest/                    # 新增回测目录
│   ├── requirements.txt         # Python依赖
│   ├── config.py                # 配置文件
│   ├── strategies/              # 策略实现
│   │   ├── __init__.py
│   │   ├── volatility_strategy.py   # 2%波动策略
│   │   ├── macd_strategy.py         # MACD策略
│   │   └── ai_enhanced_strategy.py  # AI增强策略
│   ├── data/                    # 数据处理
│   │   ├── fetcher.py          # 从NestJS API获取数据
│   │   └── loader.py           # 数据加载器
│   ├── utils/                   # 工具函数
│   │   ├── metrics.py          # 性能指标计算
│   │   └── visualize.py        # 可视化
│   ├── ai/                      # AI模块
│   │   ├── deepseek_client.py  # DeepSeek API封装
│   │   └── sentiment.py        # 情绪分析
│   ├── main.py                  # 主入口
│   └── results/                 # 回测结果输出
└── apps/
```

#### 2.3 实现2%波动策略

```python
# backtest/strategies/volatility_strategy.py

from backtesting import Strategy
from backtesting.lib import crossover
import pandas as pd

class VolatilityReversal(Strategy):
    # 可优化参数
    threshold = 2.0      # 触发阈值(%)
    stop_loss = 1.0      # 止损(%)
    take_profit = 3.0    # 止盈(%)
    
    def init(self):
        # 计算价格变化率
        close = self.data.Close
        self.price_change = ((close - close.shift(1)) / close.shift(1) * 100)
    
    def next(self):
        price_chg = self.price_change[-1]
        
        # 急跌后买入
        if price_chg <= -self.threshold and not self.position:
            self.buy(
                sl=self.data.Close[-1] * (1 - self.stop_loss/100),
                tp=self.data.Close[-1] * (1 + self.take_profit/100)
            )
        
        # 急涨后做空
        elif price_chg >= self.threshold and not self.position:
            self.sell(
                sl=self.data.Close[-1] * (1 + self.stop_loss/100),
                tp=self.data.Close[-1] * (1 - self.take_profit/100)
            )
```

#### 2.4 参数优化
- [ ] 测试不同阈值组合
- [ ] 找到最优止损止盈比
- [ ] 避免过拟合（Walk-Forward分析）

---

### 阶段三：AI集成（预计1-2周）

#### 3.1 DeepSeek API封装

```python
# backtest/ai/deepseek_client.py

import requests

class DeepSeekClient:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.deepseek.com/v1"
    
    def analyze_sentiment(self, texts: list[str]) -> float:
        """
        分析文本情绪
        返回: -1.0 到 1.0 的情绪分数
        """
        prompt = f"""
        分析以下加密货币相关文本的情绪倾向：
        
        {chr(10).join(texts)}
        
        输出一个-1到1之间的数字：
        -1表示极度看跌，0表示中性，1表示极度看涨
        只输出数字，不要其他内容。
        """
        
        response = requests.post(
            f"{self.base_url}/chat/completions",
            headers={"Authorization": f"Bearer {self.api_key}"},
            json={
                "model": "deepseek-chat",
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": 10
            }
        )
        
        result = response.json()["choices"][0]["message"]["content"]
        return float(result.strip())
```

#### 3.2 新闻爬取
- [ ] 集成CryptoPanic API
- [ ] 每小时抓取BTC相关新闻
- [ ] 存储到ai_analysis表

#### 3.3 X博主监控（可选）
- [ ] 获取Twitter API密钥（或使用Nitter RSS）
- [ ] 定义关注的KOL列表
- [ ] 定时抓取推文（每小时）
- [ ] DeepSeek分析情绪
- [ ] 存储到ai_analysis表

**KOL建议**:
```
推荐关注（影响力大）:
- @100trillionUSD (PlanB) - S2F模型创建者
- @DocumentingBTC - 新闻聚合
- @glassnode - 链上数据
- @ki_young_ju (CryptoQuant CEO)

中文KOL:
- 根据你的关注列表自定义
```

#### 3.4 AI增强策略实现

```python
# backtest/strategies/ai_enhanced_strategy.py

class AIEnhancedStrategy(Strategy):
    threshold = 2.0
    sentiment_threshold = 0.3  # 情绪过滤阈值
    
    def init(self):
        # 加载AI情绪数据
        self.sentiment_data = load_sentiment_data()
        self.price_change = ...
    
    def next(self):
        current_time = self.data.index[-1]
        
        # 获取当前时刻的情绪分数
        sentiment = self.get_sentiment(current_time)
        
        # 基础策略信号
        base_signal = self.get_base_signal()
        
        # AI过滤
        if base_signal == "BUY":
            if sentiment < -self.sentiment_threshold:
                return  # 情绪太差，跳过
            self.buy(...)
        
        elif base_signal == "SELL":
            if sentiment > self.sentiment_threshold:
                return  # 情绪太好，跳过
            self.sell(...)
```

---

### 阶段四：事件驱动回测（预计1周）

#### 4.1 手动整理历史重大事件

创建CSV文件：
```csv
event_time,event_type,title,description
2022-05-09 00:00:00,defi_collapse,Luna崩盘,UST脱锚引发螺旋死亡
2022-11-11 00:00:00,exchange_bankruptcy,FTX破产,挪用客户资金被曝光
2023-01-10 00:00:00,sec_enforcement,SEC起诉Genesis,加密借贷平台暴雷
...
```

#### 4.2 事件影响分析

```python
# 分析每个事件前后的价格走势
def analyze_event_impact(event_time):
    # 获取事件前1小时、后1小时、后24小时的价格
    before_price = get_price(event_time - 1h)
    after_1h = get_price(event_time + 1h)
    after_24h = get_price(event_time + 24h)
    
    return {
        "change_1h": (after_1h - before_price) / before_price * 100,
        "change_24h": (after_24h - before_price) / before_price * 100
    }
```

#### 4.3 事件驱动策略

```python
# 策略逻辑：
# 1. 实时监控重大新闻（通过CryptoPanic的"important"标签）
# 2. DeepSeek快速分析影响（30秒内完成）
# 3. 如果AI判断为重大利空 → 立即平仓或做空
# 4. 如果AI判断为重大利好 → 加仓或做多

class EventDrivenStrategy(Strategy):
    def init(self):
        self.event_monitor = EventMonitor(deepseek_client)
    
    def next(self):
        # 检查是否有新事件
        new_events = self.event_monitor.check_new_events()
        
        for event in new_events:
            impact = deepseek_client.analyze_event_impact(event)
            
            if impact["severity"] == "critical" and impact["direction"] == "negative":
                if self.position.is_long:
                    self.position.close()  # 立即平多单
                self.sell()  # 开空单
```

---

## 📊 性能评估标准

### 回测报告必须包含：

1. **收益指标**
   - 总收益率
   - 年化收益率
   - 月度收益分布

2. **风险指标**
   - 最大回撤
   - 夏普比率
   - 索提诺比率（Sortino Ratio，只考虑下行风险）
   - 波动率

3. **交易指标**
   - 总交易次数
   - 胜率
   - 盈亏比
   - 平均持仓时间

4. **对比基准**
   - Buy & Hold策略（对比被动持有）
   - 基础策略 vs AI增强策略（评估AI价值）

### 策略合格标准：

```
最低要求:
✓ 年化收益 > 20%
✓ 最大回撤 < 30%
✓ 夏普比率 > 1.0
✓ 胜率 > 45%
✓ 优于Buy & Hold

优秀标准:
✓ 年化收益 > 50%
✓ 最大回撤 < 20%
✓ 夏普比率 > 1.5
✓ 胜率 > 55%
```

---

## 🛠️ 开发优先级

### P0（立即开始）
1. ✅ 创建本文档
2. MySQL表结构创建
3. NestJS历史数据抓取模块
4. Python回测框架搭建
5. 实现2%波动策略

### P1（第2周）
6. MACD和布林带策略
7. DeepSeek API集成
8. CryptoPanic新闻爬取

### P2（第3-4周）
9. AI增强策略
10. X博主监控（需要先获取Twitter API）
11. 事件驱动回测

### P3（后续优化）
12. 实时模拟交易
13. 策略组合（多策略组合降低风险）
14. Web界面展示回测结果

---

## 💡 关键注意事项

### 1. 避免过拟合
- **Walk-Forward分析**: 将数据分为训练集（2022-2023）和测试集（2024）
- **Out-of-Sample测试**: 参数优化只用训练集，最终评估用测试集
- **不要过度优化**: 参数不要超过3-4个

### 2. 交易成本
- 手续费：0.1%（现货）或0.04%（合约）
- 滑点：0.05%（市场波动导致的价格偏差）
- 资金费率（如果做合约）：每8小时0.01%

### 3. 实盘注意事项
- **回测好 ≠ 实盘好**
- 流动性问题：大单可能无法成交
- 系统延迟：实盘有网络延迟
- 心理因素：机器人没有，但你要监控时会有

### 4. AI使用成本控制
```
假设：
- 每小时分析10条新闻
- 每条新闻500 tokens输入，100 tokens输出
- 每月成本 = 10 * 24 * 30 * (500*0.001 + 100*0.002) / 1000000 * 1
           ≈ ¥0.5/月

非常便宜，可以大量使用
```

---

## 🔄 后续扩展方向

### 短期（1-2个月）
- [ ] 多币种回测（ETH、SOL等）
- [ ] 多策略组合
- [ ] 实时模拟交易

### 中期（3-6个月）
- [ ] 实盘小资金测试（$100-1000）
- [ ] 策略自动切换（根据市场环境）
- [ ] 风险管理模块（仓位管理、最大亏损限制）

### 长期（6个月+）
- [ ] 高频做市策略
- [ ] 跨交易所套利
- [ ] 链上数据整合（大户持仓、交易所流入流出）
- [ ] 打新/薅羊毛自动化

---

## 🎁 空投猎人系统开发计划（撸羊毛自动化）

> **版本 v1.0** | 添加日期：2025-10-15  
> **目标**: 构建多钱包自动化交互系统，低成本获取项目空投奖励

---

### 📚 什么是空投猎人（Airdrop Farming）？

#### 核心原理

**空投（Airdrop）**: 区块链项目为了激励早期用户，向与项目交互过的钱包地址免费分发代币。

**经典案例：**

| 项目 | 空投时间 | 单钱包收益 | 资格要求 |
|-----|---------|----------|---------|
| **Uniswap** | 2020.09 | $1,200-$15,000 | 使用过Uniswap DEX |
| **ENS** | 2021.11 | $10,000-$50,000 | 注册过ENS域名 |
| **Optimism** | 2022.06 | $2,000-$10,000 | 使用过OP Layer2 |
| **Arbitrum** | 2023.03 | $1,000-$8,000 | 使用过ARB Layer2 |
| **zkSync** | 待定 | 预期$500-$5,000 | Layer2交互 |
| **LayerZero** | 待定 | 预期$1,000-$10,000 | 跨链交互 |

**撸羊毛策略**: 通过多钱包（10-100个）与潜在空投项目交互，增加空投收益。

#### 为什么要多钱包？

**单钱包问题：**
- 空投奖励通常有上限（如单钱包最多$2,000）
- 错过一些基于用户数量的奖励梯度

**100钱包策略：**
```
假设：
  单钱包空投: $2,000
  100个钱包: $2,000 × 100 = $200,000
  成本投入: $500-$2,000（gas费等）
  
潜在回报率: 100倍-400倍
```

**实际案例（Arbitrum空投）：**
- 单钱包平均: $1,800
- 100钱包玩家: $180,000
- 实际成本: ~$1,500（Layer2低手续费）
- 净收益: $178,500

---

### 🎯 空投猎人的工作流程

```
┌─────────────────────────────────────────────────────┐
│  步骤1: 项目发现与筛选                                │
│  - 监控Twitter、Discord、GitHub                      │
│  - 筛选有空投潜力的项目（Layer2、DeFi、新公链等）     │
│  - AI评估空投概率（DeepSeek分析）                    │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│  步骤2: 钱包准备与资金分配                           │
│  - 批量生成100个钱包地址                             │
│  - 从主钱包分散资金到子钱包                          │
│  - 每个钱包保留$10-$50 ETH/USDT                     │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│  步骤3: 自动化交互脚本                               │
│  - 批量执行交易（Swap、添加流动性、跨链等）           │
│  - 随机化行为（时间间隔、金额、路径）                 │
│  - 避免女巫攻击检测                                  │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│  步骤4: Gas费优化                                    │
│  - 选择低Gas时段（凌晨2-6点UTC）                     │
│  - 使用Layer2（Arbitrum/Optimism/zkSync）           │
│  - 批量交易打包（节省Gas）                           │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│  步骤5: 持续交互与数据记录                           │
│  - 每周/每月定期交互（保持活跃度）                    │
│  - 记录每个钱包的交互历史                            │
│  - 监控项目进展（融资、测试网上线等）                 │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│  步骤6: 空投领取与变现                               │
│  - 监控项目空投公告                                  │
│  - 批量Claim空投代币                                 │
│  - 归集到主钱包并卖出变现                            │
└─────────────────────────────────────────────────────┘
```

---

### 🔍 如何发现潜在空投项目？

#### ⭐⭐⭐ 数据源1: Twitter/X监控（核心来源）

**关注对象：**

```
KOL账号（空投消息灵通）:
  @CryptoRank_io - 空投日历聚合
  @AirdropDet - 空投检测
  @layer3xyz - 空投任务平台
  @QuestN_官方 - 任务平台
  
项目官方（一手消息）:
  @zkSync
  @Layerzero_Labs
  @StarkWareLtd
  @MetaMask
  @aztecnetwork
```

**监控关键词：**
```python
HIGH_PRIORITY_KEYWORDS = [
    "airdrop", "空投", "testnet", "测试网", 
    "incentive", "激励", "points", "积分",
    "early adopter", "早期用户", "retroactive",
    "token launch", "代币发布", "mainnet"
]
```

**使用工具：** Nitter RSS（免费）
```bash
# 监控@CryptoRank_io的推文
https://nitter.net/CryptoRank_io/rss
```

---

#### ⭐⭐ 数据源2: 专业空投平台

**免费平台：**

| 平台 | 链接 | 特点 |
|-----|------|-----|
| **Crypto Rank Airdrops** | https://cryptorank.io/airdrops | 实时更新，评分系统 |
| **Airdrop Alert** | https://airdropalert.com | 历史悠久，数据全 |
| **DappRadar** | https://dappradar.com/airdrops | 结合Dapp数据 |
| **Layer3** | https://layer3.xyz | 任务式空投 |
| **QuestN** | https://app.questn.com | 中文友好 |

**API支持：** DappRadar提供免费API
```bash
# 获取最新空投列表
GET https://api.dappradar.com/4tsxo4vuhotaojtl/airdrops
```

---

#### ⭐⭐⭐ 数据源3: GitHub活跃度监控

**为什么重要？**
- 真正有技术的项目 → 更大概率成功 → 空投价值高
- 提前发现还未炒热的项目

**监控指标：**
```
高潜力项目特征：
✓ Star数 > 1000（知名度）
✓ 最近30天提交 > 50次（活跃开发）
✓ 融资轮次 > Series A（有资金支持）
✓ 测试网已上线（临近主网）
```

**使用GitHub API：**
```python
# 监控zkSync仓库活跃度
GET https://api.github.com/repos/matter-labs/zksync
```

---

#### 🤖 数据源4: AI辅助筛选（DeepSeek）

**AI的价值：**
- 每天有100+新"空投项目"，99%是骗局
- 手动筛选效率低，AI可以快速过滤

**DeepSeek筛选Prompt：**
```
角色: 你是一个加密货币空投分析师

任务: 评估以下项目的空投潜力

项目信息:
  名称: {project_name}
  类型: {category}
  融资: {funding_info}
  Twitter粉丝: {followers}
  GitHub Stars: {stars}
  是否有测试网: {has_testnet}
  
输出格式JSON:
{
  "airdrop_probability": 0.85,  // 空投概率 0-1
  "risk_level": "low",           // low/medium/high
  "estimated_value": "$1000-$5000", // 预估单钱包价值
  "recommended_action": "参与",   // 参与/观望/跳过
  "reasoning": "Layer2项目，已获a16z投资，测试网活跃..."
}
```

**筛选逻辑：**
```python
if airdrop_probability > 0.7 and risk_level == "low":
    add_to_farming_list()  # 加入薅羊毛列表
elif airdrop_probability > 0.5:
    add_to_watchlist()     # 加入观察列表
else:
    skip()                 # 跳过
```

---

### 💰 手续费优化策略（核心关键！）

#### 问题：为什么要优化Gas费？

**成本计算（以太坊主网）：**
```
假设：
  100个钱包，每个钱包交互10次
  总交易数 = 1000次
  
Ethereum主网（Gas Price = 30 Gwei）:
  每次交易成本: $3-$10
  总成本: $3,000-$10,000  ❌ 太贵了！
  
Layer2（Arbitrum/Optimism）:
  每次交易成本: $0.1-$0.5
  总成本: $100-$500  ✅ 可接受
```

**结论：必须使用Layer2！**

---

#### ⭐⭐⭐ 方案1: 优先使用Layer2

**Layer2对比：**

| 网络 | Gas费 | TPS | 生态 | 空投潜力 |
|-----|-------|-----|------|---------|
| **Arbitrum** | $0.1-$0.3 | 4000+ | ⭐⭐⭐⭐⭐ | 已发放（可薅生态项目） |
| **Optimism** | $0.1-$0.4 | 2000+ | ⭐⭐⭐⭐ | 已发放（第二轮可期） |
| **zkSync Era** | $0.2-$0.5 | 2000+ | ⭐⭐⭐⭐ | **未发放（重点！）** |
| **StarkNet** | $0.1-$0.3 | 3000+ | ⭐⭐⭐ | **未发放** |
| **Scroll** | $0.2-$0.6 | 1000+ | ⭐⭐⭐ | **未发放** |
| **Base** | $0.1-$0.2 | 2000+ | ⭐⭐⭐⭐ | Coinbase出品，可能不空投 |

**推荐策略：**
```
主力网络（当前应该薅）:
1. zkSync Era - 最大潜力，融资$458M
2. StarkNet - 技术强，融资$300M
3. Scroll - 新兴Layer2，融资$80M
4. Linea（ConsenSys） - MetaMask团队

已发空投（薅生态项目）:
- Arbitrum生态DeFi
- Optimism生态DeFi
```

---

#### ⭐⭐ 方案2: 选择低Gas时段

**以太坊Gas费波动规律：**

```
时区: UTC（北京时间 -8小时）

高峰期（Gas费贵 2-3倍）:
  14:00-22:00 UTC（美国工作时间）
  22:00-02:00 UTC（亚洲工作时间）
  
低谷期（Gas费便宜）:
  02:00-06:00 UTC（全球休息时间）  ⭐ 最佳
  06:00-10:00 UTC（欧洲早晨）
  
周末: 比工作日便宜20-30%
```

**实施方案：**
```python
# 自动化脚本在低Gas时段执行
OPTIMAL_HOURS_UTC = [2, 3, 4, 5, 6]  # UTC时间

def should_execute_tx():
    current_hour = datetime.utcnow().hour
    gas_price = get_current_gas_price()
    
    if current_hour in OPTIMAL_HOURS_UTC and gas_price < 20:  # < 20 Gwei
        return True
    return False
```

**Gas追踪工具：**
- GasNow: https://www.gasnow.org/
- Etherscan Gas Tracker: https://etherscan.io/gastracker

---

#### ⭐⭐⭐ 方案3: 批量交易优化

**问题：**
- 100个钱包独立交易 → 100次签名 → 100次广播 → 慢且贵

**解决方案：Multicall合约**

```solidity
// 一次交易调用多个合约
interface IMulticall {
    function aggregate(
        address[] targets,    // 目标合约
        bytes[] callData      // 调用数据
    ) external returns (bytes[] results);
}
```

**效果：**
```
传统方式:
  100次交易 = 100 × $0.3 = $30

Multicall方式:
  1次交易（打包100个调用） = $2
  节省93%！
```

**局限性：**
- 不是所有操作都能批量（如需要不同钱包地址）
- 但可用于批量Claim空投

---

#### 方案4: 其他优化技巧

**1. EIP-1559优化**
```javascript
// 不要设置maxPriorityFeePerGas太高
{
  maxFeePerGas: 30 gwei,
  maxPriorityFeePerGas: 1 gwei,  // 不要设置2+ gwei（浪费钱）
}
```

**2. 使用Gas Token（高级）**
- 在Gas便宜时铸造CHI/GST2
- 在Gas贵时燃烧抵消费用
- 适合大规模操作（>1000笔）

**3. 选择非拥堵网络**
```
避免在以下时间交互Ethereum主网:
❌ NFT Mint（Gas暴涨10倍）
❌ 重大事件（如FTX崩盘）
❌ MEV机器人大战时段
```

---

### 🛠️ 多钱包管理方案

#### 钱包生成策略

**方案对比：**

| 方案 | 优点 | 缺点 | 推荐度 |
|-----|------|------|--------|
| **HD钱包（分层确定性）** | 一个助记词管理全部 | 助记词泄露全失 | ⭐⭐⭐⭐⭐ |
| **独立助记词** | 安全性高 | 管理困难 | ⭐⭐ |
| **Keystore文件** | 支持加密 | 文件管理麻烦 | ⭐⭐⭐ |

**推荐：HD钱包（BIP44标准）**

```python
# 使用eth-account库生成HD钱包
from eth_account import Account
from mnemonic import Mnemonic

# 生成主助记词
mnemo = Mnemonic("english")
mnemonic = mnemo.generate(strength=256)  # 24个单词

# 派生100个子钱包
wallets = []
for i in range(100):
    # BIP44路径: m/44'/60'/0'/0/{i}
    account = Account.from_mnemonic(
        mnemonic, 
        account_path=f"m/44'/60'/0'/0/{i}"
    )
    wallets.append({
        "index": i,
        "address": account.address,
        "private_key": account.key.hex()
    })
```

**安全建议：**
```
✓ 助记词离线保存（纸张+金属板）
✓ 私钥加密存储（AES-256）
✓ 不要在云端保存明文私钥
✓ 使用硬件钱包管理主钱包
```

---

#### 资金分配策略

**初始资金规划（100钱包为例）：**

```
总预算: $5,000-$10,000

Layer2网络分配（每个钱包）:
  zkSync Era: $30-$50
  StarkNet: $20-$40
  Scroll: $20-$40
  Linea: $20-$40
  
单钱包总计: $90-$170

100钱包总成本: $9,000-$17,000
备用Gas费: $500-$1,000
```

**分配脚本：**
```python
# 从主钱包批量转账到子钱包
def distribute_funds(master_wallet, sub_wallets, amount_per_wallet):
    """
    批量分发资金到子钱包
    """
    for wallet in sub_wallets:
        # 构建转账交易
        tx = {
            'from': master_wallet.address,
            'to': wallet['address'],
            'value': Web3.toWei(amount_per_wallet, 'ether'),
            'gas': 21000,
            'gasPrice': web3.eth.gas_price,
            'nonce': web3.eth.get_transaction_count(master_wallet.address),
        }
        
        # 签名并发送
        signed = master_wallet.sign_transaction(tx)
        tx_hash = web3.eth.send_raw_transaction(signed.rawTransaction)
        
        print(f"发送 {amount_per_wallet} ETH 到 {wallet['address']}")
        
        # 避免nonce冲突，等待1秒
        time.sleep(1)
```

---

#### 钱包状态监控

**需要追踪的数据：**

```sql
-- 钱包状态表
CREATE TABLE wallet_status (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  wallet_index INT NOT NULL,              -- 钱包索引
  address VARCHAR(42) NOT NULL,           -- 钱包地址
  network VARCHAR(20) NOT NULL,           -- 网络: zkSync, StarkNet等
  balance DECIMAL(20,8),                  -- 当前余额
  tx_count INT DEFAULT 0,                 -- 交易次数
  last_active_time BIGINT,                -- 最后活跃时间
  projects JSON,                          -- 交互过的项目列表
  status VARCHAR(20) DEFAULT 'active',    -- active/paused/depleted
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_address (address),
  INDEX idx_network (network)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='多钱包状态追踪';

-- 交互记录表
CREATE TABLE interaction_history (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  wallet_address VARCHAR(42) NOT NULL,
  project_name VARCHAR(100) NOT NULL,    -- 项目名称
  action_type VARCHAR(50) NOT NULL,      -- swap/bridge/mint/stake等
  tx_hash VARCHAR(66),                   -- 交易哈希
  gas_used DECIMAL(20,8),                -- 花费gas
  timestamp BIGINT NOT NULL,
  success BOOLEAN DEFAULT TRUE,
  
  INDEX idx_wallet (wallet_address),
  INDEX idx_project (project_name),
  INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='钱包交互历史';
```

**监控面板（Web界面）：**
```
功能需求:
✓ 实时显示100个钱包余额
✓ 每个钱包的交互次数统计
✓ Gas费总花费
✓ 项目交互进度（如：80/100钱包已完成zkSync交互）
✓ 预警：余额不足/长时间未活跃
```

---

### 🤖 自动化交互脚本开发

#### 核心交互类型

**1. DEX Swap（去中心化交易）**
```python
# 在Uniswap/SushiSwap等DEX上交换代币
def auto_swap(wallet, dex_router, token_in, token_out, amount):
    """
    自动Swap交易
    
    参数:
      - wallet: 钱包对象
      - dex_router: DEX路由合约地址
      - token_in: 输入代币地址（如USDC）
      - token_out: 输出代币地址（如ETH）
      - amount: 交易数量
    """
    # 1. 授权DEX使用你的代币
    approve_tx = token_in_contract.functions.approve(
        dex_router, 
        amount
    ).build_transaction({
        'from': wallet.address,
        'gas': 100000,
        'gasPrice': web3.eth.gas_price,
        'nonce': web3.eth.get_transaction_count(wallet.address),
    })
    
    signed_approve = wallet.sign_transaction(approve_tx)
    web3.eth.send_raw_transaction(signed_approve.rawTransaction)
    
    # 2. 执行Swap
    deadline = int(time.time()) + 300  # 5分钟有效期
    
    swap_tx = dex_router.functions.swapExactTokensForTokens(
        amount,           # 输入数量
        0,                # 最小输出（0表示接受任何滑点，生产环境应设置）
        [token_in, token_out],  # 路径
        wallet.address,   # 接收地址
        deadline
    ).build_transaction({
        'from': wallet.address,
        'gas': 200000,
        'gasPrice': web3.eth.gas_price,
        'nonce': web3.eth.get_transaction_count(wallet.address) + 1,
    })
    
    signed_swap = wallet.sign_transaction(swap_tx)
    tx_hash = web3.eth.send_raw_transaction(signed_swap.rawTransaction)
    
    return tx_hash.hex()
```

**2. 跨链桥接（Bridge）**
```python
# 使用LayerZero/Stargate等跨链桥
def auto_bridge(wallet, from_chain, to_chain, amount):
    """
    跨链桥接（对LayerZero空投非常重要！）
    
    示例: 从Arbitrum桥接USDC到Optimism
    """
    stargate_router = "0x8731d54E9D02c286767d56ac03e8037C07e01e98"  # Arbitrum
    
    # LayerZero链ID
    CHAIN_IDS = {
        "ethereum": 101,
        "arbitrum": 110,
        "optimism": 111,
        "polygon": 109,
    }
    
    bridge_tx = stargate_contract.functions.swap(
        CHAIN_IDS[to_chain],      # 目标链
        1,                         # 池ID（USDC）
        1,                         # 目标池ID
        wallet.address,            # 退款地址
        amount,                    # 数量
        0,                         # 最小输出
        {                          # LayerZero参数
            'dstGasForCall': 0,
            'dstNativeAmount': 0,
            'dstNativeAddr': '0x'
        },
        wallet.address,            # 接收地址
        '0x'
    ).build_transaction({...})
    
    signed = wallet.sign_transaction(bridge_tx)
    return web3.eth.send_raw_transaction(signed.rawTransaction)
```

**3. 添加流动性（Liquidity）**
```python
def add_liquidity(wallet, dex_router, token_a, token_b, amount_a, amount_b):
    """
    为DEX提供流动性（获得LP代币）
    """
    # 授权两个代币
    approve_token(wallet, token_a, dex_router, amount_a)
    approve_token(wallet, token_b, dex_router, amount_b)
    
    # 添加流动性
    deadline = int(time.time()) + 300
    
    liq_tx = dex_router.functions.addLiquidity(
        token_a,
        token_b,
        amount_a,
        amount_b,
        0,  # 最小A
        0,  # 最小B
        wallet.address,
        deadline
    ).build_transaction({...})
    
    signed = wallet.sign_transaction(liq_tx)
    return web3.eth.send_raw_transaction(signed.rawTransaction)
```

**4. NFT Mint**
```python
def mint_nft(wallet, nft_contract, mint_price):
    """
    Mint NFT（很多项目要求mint测试网NFT）
    """
    mint_tx = nft_contract.functions.mint().build_transaction({
        'from': wallet.address,
        'value': Web3.toWei(mint_price, 'ether'),
        'gas': 150000,
        'gasPrice': web3.eth.gas_price,
        'nonce': web3.eth.get_transaction_count(wallet.address),
    })
    
    signed = wallet.sign_transaction(mint_tx)
    return web3.eth.send_raw_transaction(signed.rawTransaction)
```

---

#### 反女巫攻击策略（非常重要！）

**什么是女巫攻击检测？**

项目方会检测批量操作的"机器人"钱包，并取消空投资格。

**典型检测特征：**
```
❌ 所有钱包在同一时间交易（如1分钟内100笔）
❌ 所有钱包交易金额完全相同（如都是0.1 ETH）
❌ 所有钱包的资金来自同一个主钱包
❌ 交易顺序固定（都是先Swap再Bridge）
❌ 钱包之间有明显关联（地址连续）
```

**反检测策略：**

**1. 时间随机化**
```python
import random

def execute_with_random_delay(wallets, task_func):
    """
    随机时间间隔执行任务
    """
    for wallet in wallets:
        # 随机延迟 5分钟-2小时
        delay = random.randint(300, 7200)
        time.sleep(delay)
        
        task_func(wallet)
        
        print(f"钱包 {wallet['index']} 已执行，等待 {delay/60:.1f} 分钟后继续")
```

**2. 金额随机化**
```python
def get_random_amount(base_amount, variance=0.2):
    """
    生成随机金额（±20%浮动）
    
    示例: base=100, 输出=85-115
    """
    min_amount = base_amount * (1 - variance)
    max_amount = base_amount * (1 + variance)
    return random.uniform(min_amount, max_amount)

# 使用
for wallet in wallets:
    amount = get_random_amount(0.1)  # 0.08-0.12 ETH
    swap(wallet, amount)
```

**3. 行为路径随机化**
```python
# 定义多种交互路径
INTERACTION_PATHS = [
    ["swap", "bridge", "add_liquidity", "stake"],
    ["bridge", "swap", "stake", "add_liquidity"],
    ["swap", "add_liquidity", "bridge"],
    ["bridge", "add_liquidity", "swap", "stake"],
]

for wallet in wallets:
    # 随机选择一种路径
    path = random.choice(INTERACTION_PATHS)
    
    for action in path:
        execute_action(wallet, action)
        time.sleep(random.randint(1800, 7200))  # 30分钟-2小时
```

**4. 使用中间钱包混淆**
```
主钱包 → 10个中间钱包 → 100个工作钱包

好处:
✓ 打断资金流追踪
✓ 每个中间钱包分发10个工作钱包，看起来更"自然"
```

**5. IP地址隔离（高级）**
```
问题: 100个钱包从同一个IP发交易 → 明显是机器人

解决方案:
  方案A: 使用住宅代理池（$50-$100/月）
  方案B: 部署到不同VPS（$5/月 × 5台 = $25/月）
  方案C: 使用去中心化RPC（避免Infura/Alchemy关联）
```

---

### 📊 项目评分与优先级系统

#### AI驱动的项目评分

**评分维度：**

```python
class AirdropProjectScorer:
    """
    空投项目评分系统
    """
    WEIGHTS = {
        "funding": 0.25,          # 融资情况
        "team": 0.15,              # 团队背景
        "tech": 0.15,              # 技术实力
        "community": 0.15,         # 社区热度
        "tokenomics": 0.15,        # 代币经济学
        "timeline": 0.15,          # 时间线（临近主网）
    }
    
    def score_project(self, project_info):
        """
        综合评分（0-100分）
        """
        scores = {}
        
        # 1. 融资评分
        if project_info['total_funding'] > 100_000_000:  # >$100M
            scores['funding'] = 100
        elif project_info['total_funding'] > 50_000_000:
            scores['funding'] = 80
        elif project_info['total_funding'] > 10_000_000:
            scores['funding'] = 60
        else:
            scores['funding'] = 30
            
        # 2. 团队评分
        scores['team'] = self.evaluate_team(project_info['team'])
        
        # 3. 技术评分
        scores['tech'] = self.evaluate_tech(
            github_stars=project_info['github_stars'],
            commits_30d=project_info['commits_30d']
        )
        
        # 4. 社区热度
        scores['community'] = self.evaluate_community(
            twitter_followers=project_info['twitter_followers'],
            discord_members=project_info['discord_members']
        )
        
        # 5. 代币经济学（有明确空投计划吗？）
        scores['tokenomics'] = self.evaluate_tokenomics(
            has_airdrop_hint=project_info['has_airdrop_hint'],
            community_allocation=project_info['community_allocation']
        )
        
        # 6. 时间线评分（越接近主网分数越高）
        scores['timeline'] = self.evaluate_timeline(
            mainnet_status=project_info['mainnet_status']
        )
        
        # 加权总分
        total_score = sum(
            scores[k] * self.WEIGHTS[k] 
            for k in scores
        )
        
        return {
            "total_score": round(total_score, 2),
            "sub_scores": scores,
            "recommendation": self.get_recommendation(total_score)
        }
    
    def get_recommendation(self, score):
        if score >= 80:
            return "🔥 高优先级 - 立即参与"
        elif score >= 60:
            return "✅ 中优先级 - 可以参与"
        elif score >= 40:
            return "⚠️ 低优先级 - 观望"
        else:
            return "❌ 不推荐 - 跳过"
```

**使用DeepSeek辅助评分：**

```python
def ai_evaluate_project(project_name, project_desc):
    """
    使用DeepSeek评估项目
    """
    prompt = f"""
    评估以下区块链项目的空投潜力：
    
    项目名称: {project_name}
    项目描述: {project_desc}
    
    请从以下维度评分（0-100）：
    1. 空投概率（是否明示或暗示会有空投）
    2. 空投价值（预估单钱包能获得多少美元）
    3. 风险等级（项目可能失败/跑路的风险）
    4. 参与成本（需要投入多少资金和时间）
    5. 时间紧迫度（是否需要立即参与）
    
    输出JSON格式：
    {{
      "airdrop_probability": 85,
      "estimated_value_usd": "1000-5000",
      "risk_score": 20,
      "participation_cost_usd": "50-100",
      "urgency": "high",
      "reasoning": "Layer2项目，测试网已上线6个月，融资$200M..."
    }}
    """
    
    response = deepseek_client.chat(prompt)
    return json.loads(response)
```

---

#### 当前高潜力项目列表（2025年Q4）

| 项目 | 类型 | 融资 | 空投概率 | 预估价值 | 参与难度 | 推荐度 |
|-----|------|------|---------|---------|---------|--------|
| **zkSync Era** | Layer2 | $458M | 95% | $1000-$5000 | 中 | ⭐⭐⭐⭐⭐ |
| **LayerZero** | 跨链协议 | $293M | 90% | $1000-$8000 | 中 | ⭐⭐⭐⭐⭐ |
| **StarkNet** | Layer2 | $282M | 85% | $500-$3000 | 难 | ⭐⭐⭐⭐ |
| **Scroll** | Layer2 | $80M | 80% | $500-$2000 | 易 | ⭐⭐⭐⭐ |
| **Linea** | Layer2 | ConsenSys | 75% | $500-$2000 | 易 | ⭐⭐⭐⭐ |
| **Zeta Chain** | 跨链 | $27M | 70% | $300-$1500 | 中 | ⭐⭐⭐ |
| **Fuel Network** | Modular | $81M | 65% | $500-$2000 | 难 | ⭐⭐⭐ |

**参与策略：**
```
P0（立即参与）:
✓ zkSync Era - 每周至少1次交互
✓ LayerZero - 至少完成10次跨链
✓ StarkNet - 完成官方任务

P1（定期参与）:
✓ Scroll - 每月2-3次交互
✓ Linea - 每月2-3次交互

P2（观望）:
✓ Zeta Chain - 关注进展
✓ Fuel Network - 等待测试网优化
```

---

### 🚀 空投猎人系统开发计划

#### 阶段一：基础设施搭建（1-2周）

**1.1 钱包管理模块**
- [ ] 实现HD钱包生成（100个地址）
- [ ] 钱包私钥加密存储
- [ ] 批量资金分发脚本
- [ ] 钱包余额监控

**技术栈：**
```python
依赖:
  - web3.py: 以太坊交互
  - eth-account: 钱包管理
  - mnemonic: 助记词生成
  - cryptography: 私钥加密
```

**目录结构：**
```
sentinel/
├── airdrop-hunter/              # 空投猎人系统
│   ├── wallets/                 # 钱包管理
│   │   ├── generator.py        # HD钱包生成
│   │   ├── manager.py          # 钱包管理器
│   │   └── encryptor.py        # 加密工具
│   ├── interactions/            # 交互脚本
│   │   ├── dex_swap.py         # DEX交换
│   │   ├── bridge.py           # 跨链桥
│   │   ├── liquidity.py        # 流动性
│   │   └── nft.py              # NFT mint
│   ├── monitors/                # 监控模块
│   │   ├── project_tracker.py  # 项目追踪
│   │   ├── gas_monitor.py      # Gas费监控
│   │   └── balance_checker.py  # 余额检查
│   ├── ai/                      # AI评分
│   │   ├── project_scorer.py   # 项目评分
│   │   └── deepseek_client.py  # AI客户端
│   ├── config.py                # 配置文件
│   ├── requirements.txt         # Python依赖
│   └── main.py                  # 主入口
└── apps/
```

**1.2 MySQL数据表**
```sql
-- 见前面的wallet_status和interaction_history表
```

**1.3 配置文件**
```yaml
# airdrop-hunter/config.yaml

wallets:
  count: 100
  hd_path: "m/44'/60'/0'/0"
  encryption_key: "${WALLET_ENCRYPTION_KEY}"

networks:
  zksync:
    rpc: "https://mainnet.era.zksync.io"
    chain_id: 324
    initial_balance: 50  # USDT
  starknet:
    rpc: "https://starknet-mainnet.public.blastapi.io"
    chain_id: "SN_MAIN"
    initial_balance: 30
    
gas_optimization:
  max_gas_price_gwei: 30
  optimal_hours_utc: [2, 3, 4, 5, 6]
  use_layer2_first: true

anti_sybil:
  time_delay_min_sec: 300     # 最小5分钟
  time_delay_max_sec: 7200    # 最大2小时
  amount_variance: 0.2        # ±20%
  random_seed: null           # 随机种子
```

---

#### 阶段二：项目监控与筛选（1周）

**2.1 Twitter监控集成**
- [ ] 集成Nitter RSS
- [ ] 关键词过滤（airdrop, testnet等）
- [ ] 新项目自动提取

**2.2 GitHub活跃度监控**
- [ ] GitHub API集成
- [ ] Star/Commit/Issue追踪
- [ ] 热门项目自动发现

**2.3 AI项目评分**
- [ ] DeepSeek API集成
- [ ] 自动评分流程
- [ ] 评分结果存储

**2.4 项目数据库**
```sql
CREATE TABLE airdrop_projects (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  project_name VARCHAR(100) NOT NULL,
  category VARCHAR(50),                  -- Layer2/DeFi/NFT等
  website VARCHAR(255),
  twitter VARCHAR(100),
  discord VARCHAR(255),
  
  -- 评分数据
  total_funding BIGINT,                  -- 融资金额（USD）
  funding_round VARCHAR(50),             -- 融资轮次
  investors JSON,                        -- 投资方列表
  github_url VARCHAR(255),
  github_stars INT,
  
  -- AI评分
  airdrop_probability DECIMAL(3,2),      -- 0-1
  estimated_value_min INT,               -- 最小预估价值
  estimated_value_max INT,               -- 最大预估价值
  risk_level VARCHAR(20),                -- low/medium/high
  ai_score INT,                          -- 0-100
  
  -- 状态
  status VARCHAR(20) DEFAULT 'pending',  -- pending/active/completed/failed
  mainnet_launched BOOLEAN DEFAULT FALSE,
  airdrop_announced BOOLEAN DEFAULT FALSE,
  
  -- 交互要求
  required_actions JSON,                 -- ["swap", "bridge", "mint_nft"]
  min_tx_count INT,                      -- 最少交易次数
  min_volume INT,                        -- 最少交易量
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_score (ai_score DESC),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='空投项目数据库';
```

---

#### 阶段三：自动化交互引擎（2-3周）

**3.1 核心交互实现**
- [ ] DEX Swap（Uniswap/SushiSwap）
- [ ] 跨链桥接（LayerZero/Stargate）
- [ ] 添加流动性
- [ ] NFT Mint
- [ ] Staking质押

**3.2 反女巫攻击模块**
- [ ] 时间随机化
- [ ] 金额随机化
- [ ] 行为路径随机化
- [ ] IP隔离（可选）

**3.3 任务调度系统**
```python
# 任务队列管理
class TaskScheduler:
    """
    任务调度器：管理100个钱包的交互任务
    """
    def __init__(self):
        self.task_queue = Queue()
        self.wallets = load_wallets()
    
    def schedule_project_interaction(self, project_name, action_list):
        """
        为某个项目安排所有钱包的交互任务
        
        示例: schedule_project_interaction("zkSync", ["swap", "bridge"])
        """
        for wallet in self.wallets:
            # 生成随机执行时间
            execute_time = datetime.now() + timedelta(
                seconds=random.randint(300, 86400)  # 5分钟-24小时内
            )
            
            task = {
                "wallet": wallet,
                "project": project_name,
                "actions": action_list,
                "execute_at": execute_time,
                "status": "pending"
            }
            
            self.task_queue.put(task)
            print(f"已为钱包 {wallet['index']} 安排任务，执行时间: {execute_time}")
    
    def run(self):
        """
        后台运行，执行到期的任务
        """
        while True:
            if not self.task_queue.empty():
                task = self.task_queue.get()
                
                if datetime.now() >= task['execute_at']:
                    self.execute_task(task)
                else:
                    # 还没到时间，放回队列
                    self.task_queue.put(task)
            
            time.sleep(60)  # 每分钟检查一次
    
    def execute_task(self, task):
        """
        执行具体任务
        """
        wallet = task['wallet']
        project = task['project']
        
        for action in task['actions']:
            try:
                if action == "swap":
                    auto_swap(wallet, project)
                elif action == "bridge":
                    auto_bridge(wallet, project)
                # ... 其他操作
                
                # 记录到数据库
                log_interaction(wallet['address'], project, action, success=True)
                
            except Exception as e:
                print(f"钱包 {wallet['index']} 执行 {action} 失败: {e}")
                log_interaction(wallet['address'], project, action, success=False)
            
            # 操作间隔
            time.sleep(random.randint(60, 300))
```

**3.4 Gas费优化**
- [ ] 实时Gas价格监控
- [ ] 低Gas时段自动执行
- [ ] Layer2优先策略

---

#### 阶段四：监控与报警（1周）

**4.1 实时监控面板**
- [ ] Web前端（React/Vue）
- [ ] 钱包状态总览
- [ ] 项目进度仪表盘
- [ ] Gas费消耗统计

**前端功能：**
```
页面1: 钱包概览
  - 100个钱包的余额地图（绿色=充足，黄色=偏低，红色=耗尽）
  - 总资产统计
  - Gas费总消耗

页面2: 项目进度
  - 各项目交互完成度（如：zkSync 85/100 已完成）
  - 待办任务列表
  - 预计完成时间

页面3: 交互历史
  - 最近100笔交易
  - 成功率统计
  - 失败交易分析

页面4: AI推荐
  - 新发现的高分项目
  - 紧急项目提醒（如：主网即将上线）
```

**4.2 Bark/Telegram通知**
- [ ] 余额不足预警
- [ ] 高价值项目发现提醒
- [ ] 空投公告通知
- [ ] 任务完成报告

```python
# 集成Bark推送
def send_bark_notification(title, content):
    bark_url = "https://api.day.app/{your_key}/"
    requests.get(f"{bark_url}{title}/{content}")

# 示例
send_bark_notification(
    "zkSync空投公告", 
    "zkSync将于3天后发放空投，请及时Claim！"
)
```

**4.3 定期报告**
```
每日报告:
  - 今日交易笔数
  - Gas费消耗
  - 新项目发现

每周报告:
  - 项目进度汇总
  - 预估空投价值
  - 下周计划

每月报告:
  - 总投入vs预期收益
  - 各项目ROI分析
  - 策略优化建议
```

---

#### 阶段五：空投领取与变现（持续）

**5.1 空投公告监控**
- [ ] 监控项目官方Twitter
- [ ] 监控Discord公告频道
- [ ] AI自动识别空投消息

```python
def detect_airdrop_announcement(tweet_text):
    """
    AI检测推文是否为空投公告
    """
    prompt = f"""
    判断以下推文是否为空投公告：
    
    "{tweet_text}"
    
    输出JSON：
    {{
      "is_airdrop": true/false,
      "project_name": "zkSync",
      "claim_start_time": "2025-10-20",
      "claim_url": "https://...",
      "urgency": "high/medium/low"
    }}
    """
    
    result = deepseek_client.chat(prompt)
    return json.loads(result)
```

**5.2 批量Claim脚本**
```python
def batch_claim_airdrop(project_contract, wallets):
    """
    批量领取空投
    """
    for wallet in wallets:
        try:
            # 检查是否有资格
            eligible = project_contract.functions.isEligible(
                wallet['address']
            ).call()
            
            if not eligible:
                print(f"钱包 {wallet['index']} 无空投资格")
                continue
            
            # 领取空投
            claim_tx = project_contract.functions.claim().build_transaction({
                'from': wallet['address'],
                'gas': 150000,
                'gasPrice': web3.eth.gas_price,
                'nonce': web3.eth.get_transaction_count(wallet['address']),
            })
            
            signed = wallet.sign_transaction(claim_tx)
            tx_hash = web3.eth.send_raw_transaction(signed.rawTransaction)
            
            print(f"钱包 {wallet['index']} 已领取空投: {tx_hash.hex()}")
            
            # 防止nonce冲突
            time.sleep(2)
            
        except Exception as e:
            print(f"钱包 {wallet['index']} 领取失败: {e}")
```

**5.3 代币归集与变现**
```python
def consolidate_and_sell(wallets, token_address, dex_router):
    """
    归集代币到主钱包并卖出
    """
    main_wallet = load_main_wallet()
    
    # 步骤1: 从所有子钱包转移到主钱包
    for wallet in wallets:
        balance = get_token_balance(wallet['address'], token_address)
        
        if balance > 0:
            transfer_token(
                from_wallet=wallet,
                to_address=main_wallet.address,
                token_address=token_address,
                amount=balance
            )
    
    # 步骤2: 主钱包卖出
    total_balance = get_token_balance(main_wallet.address, token_address)
    
    swap_to_usdt(
        wallet=main_wallet,
        token_in=token_address,
        amount=total_balance,
        dex_router=dex_router
    )
    
    print(f"已卖出 {total_balance} 代币，兑换为 USDT")
```

---

### 💰 成本与收益分析

#### 初期投入（100钱包规模）

```
硬件/软件成本:
  VPS服务器（运行脚本）:    $10-$20/月
  代理服务（可选）:          $0-$50/月
  MySQL托管（可选）:         $0（本地）- $10/月
  
小计: $10-$80/月

资金成本:
  Layer2网络资金:
    - zkSync Era: $50 × 100 = $5,000
    - StarkNet: $30 × 100 = $3,000
    - Scroll: $30 × 100 = $3,000
    - Linea: $30 × 100 = $3,000
  
  小计: $14,000（可循环使用）
  
Gas费预算:
  每个钱包平均20笔交易
  Layer2平均 $0.3/笔
  总计: 100 × 20 × $0.3 = $600
  
总初期投入: ~$15,000
```

#### 预期收益（保守估计）

**场景1: 2个项目空投（保守）**
```
zkSync空投:
  单钱包: $1,500
  100钱包: $150,000
  
LayerZero空投:
  单钱包: $2,000
  100钱包: $200,000
  
总收益: $350,000
投入: $15,000
ROI: 2,233%（23倍回报）
```

**场景2: 4个项目空投（乐观）**
```
zkSync + LayerZero + StarkNet + Scroll:
  总收益: $600,000
  投入: $15,000
  ROI: 3,900%（39倍回报）
```

**场景3: 保守预期（只成功1个）**
```
假设只有zkSync发空投，其他项目失败:
  收益: $150,000
  投入: $15,000
  ROI: 900%（9倍回报）
  
仍然是高回报项目！
```

---

### ⚠️ 风险与注意事项

#### 技术风险

**1. 女巫攻击检测**
```
风险: 项目方识别出你的批量钱包，取消资格
缓解: 
  ✓ 严格执行反女巫策略（随机化）
  ✓ 不要贪心，10-50个钱包更安全
  ✓ 模拟真实用户行为
```

**2. 智能合约风险**
```
风险: 交互的项目合约有漏洞，资金被盗
缓解:
  ✓ 只与知名项目交互
  ✓ 使用小额测试
  ✓ 定期转移资金到冷钱包
```

**3. 私钥安全**
```
风险: 100个私钥管理不当，被黑客窃取
缓解:
  ✓ 私钥AES-256加密
  ✓ 助记词离线备份
  ✓ 使用硬件钱包管理主钱包
```

#### 市场风险

**1. 项目不空投**
```
风险: 辛苦交互数月，项目最终不发空投
概率: 30-40%（很多项目会变卦）
缓解:
  ✓ 同时参与多个项目（不要All-in一个）
  ✓ 优先选择明示空投的项目
  ✓ 关注项目融资和代币经济学
```

**2. 空投价值低于预期**
```
风险: 预期$2000，实际只给$200
缓解:
  ✓ 保守估计收益
  ✓ 控制Gas成本
  ✓ 第一时间卖出（避免代币暴跌）
```

**3. 熊市影响**
```
风险: 领到空投时正好遇到熊市，代币价值大缩水
缓解:
  ✓ 领取后立即卖出（不要抱有幻想）
  ✓ 或质押锁仓等待牛市
```

#### 合规风险

**1. 税务问题**
```
注意: 空投在很多国家被视为收入，需要报税
建议:
  - 咨询当地税务律师
  - 保留交易记录
  - 如果金额大（>$50k），建议合规处理
```

**2. 交易所KYC**
```
问题: 卖出大量空投代币时，CEX可能要求说明资金来源
建议:
  - 使用DEX去中心化交易（无KYC）
  - 或分批卖出（避免触发风控）
```

---

### 🎯 立即行动清单

#### 第一步：学习与准备（1-2天）

- [ ] 阅读本文档3遍，理解核心概念
- [ ] 注册DeepSeek API（AI评分必须）
- [ ] 准备初始资金（建议$5,000-$15,000）
- [ ] 学习Web3.py基础（如果不熟悉）

#### 第二步：环境搭建（3-5天）

- [ ] 租用VPS服务器（推荐Contabo/Hetzner，$10/月）
- [ ] 安装Python 3.10+、MySQL
- [ ] 生成100个HD钱包
- [ ] 测试网测试（Goerli/Sepolia）

#### 第三步：首个项目实战（1周）

**推荐新手项目：Scroll（难度低，Gas便宜）**

- [ ] 为10个钱包分发资金（先小规模测试）
- [ ] 完成Scroll的基础交互：
  - [ ] 从Ethereum桥接到Scroll
  - [ ] 在Scroll上Swap 5次
  - [ ] 添加流动性
  - [ ] Mint测试NFT
- [ ] 观察结果，优化脚本
- [ ] 扩展到100个钱包

#### 第四步：多项目并行（持续）

- [ ] zkSync Era（每周交互）
- [ ] LayerZero（完成10条跨链路径）
- [ ] StarkNet（完成官方任务）
- [ ] Linea（每月2-3次交互）

#### 第五步：监控与优化（持续）

- [ ] 每日检查钱包余额
- [ ] 每周Review项目进展
- [ ] 关注Twitter空投公告
- [ ] 优化Gas费策略

---

## 📚 学习资源

### 空投猎人社区

- **Discord**: 
  - Layer3 Discord（任务平台）
  - Airdrop Nation
  
- **Twitter必关注**:
  - @CryptoRank_io
  - @AirdropDet
  - @DeFi_Airdrops
  
- **中文社区**:
  - Mirror: "空投猎人手册"
  - Notion: 各种空投日历

### 技术文档

- **Web3.py**: https://web3py.readthedocs.io/
- **Ethers.js**: https://docs.ethers.io/（如果用JS）
- **LayerZero Docs**: https://layerzero.gitbook.io/
- **zkSync Docs**: https://docs.zksync.io/

---

## 📝 更新日志

### v1.0 (2025-10-15 新增)

**新增章节：空投猎人系统开发计划**

1. **核心内容**
   - ✅ 空投猎人原理科普
   - ✅ 成功案例分析（Uniswap/Arbitrum等）
   - ✅ 完整工作流程（项目发现→交互→领取）

2. **技术方案**
   - ✅ 多钱包管理（HD钱包方案）
   - ✅ Gas费优化策略（Layer2优先，低Gas时段）
   - ✅ 反女巫攻击策略（5种随机化方法）

3. **数据源与监控**
   - ✅ Twitter/GitHub/专业平台监控
   - ✅ AI项目评分系统（DeepSeek集成）
   - ✅ 当前高潜力项目列表

4. **自动化开发**
   - ✅ 5阶段开发计划（基础→监控→交互→报警→变现）
   - ✅ 代码示例（Python/Solidity）
   - ✅ 数据库表设计

5. **成本与收益**
   - ✅ 详细成本拆解（$15,000初期投入）
   - ✅ 3种收益场景（9倍-39倍ROI）
   - ✅ 风险控制建议

6. **立即行动**
   - ✅ 5步实施路径
   - ✅ 新手友好项目推荐（Scroll）
   - ✅ 学习资源汇总

**总成本**: $15,000（含可循环资金）  
**预期ROI**: 900%-3900%（9倍-39倍回报）  
**风险等级**: 中等（需要技术能力和时间投入）

---

有任何问题随时沟通！空投猎人是高回报项目，但需要耐心和技术。🎁

---

## 📚 学习资源

### 量化交易入门
- 书籍：《Python金融大数据分析》
- 在线课程：Coursera - Machine Learning for Trading

### 回测框架文档
- [Backtesting.py官方文档](https://kernc.github.io/backtesting.py/)
- [VectorBT教程](https://vectorbt.dev/)

### 加密货币数据
- [Binance API文档](https://binance-docs.github.io/apidocs/)
- [CryptoPanic API](https://cryptopanic.com/developers/api/)

### DeepSeek
- [DeepSeek API文档](https://platform.deepseek.com/api-docs/)

---

## 📞 协作说明

**文档用途**: 
- 你可以将此文档提供给其他AI（ChatGPT/Claude等）继续开发
- 文档包含完整的技术细节和实现路径
- 每个阶段都有明确的交付物

**如何使用**:
```
提示词示例:
"我有一个加密货币回测项目，请阅读BACKTEST_PLAN.md，
帮我实现【阶段一：数据基础建设】中的NestJS历史数据抓取模块"
```

---

## ✅ 检查清单

### 必须准备（开始开发前）
- [ ] MySQL已安装并运行
- [ ] 已有Binance API访问权限（免费）
- [ ] **已获取DeepSeek API Key**（必须，用于AI分析）
- [ ] Python 3.8+已安装
- [ ] NestJS后端可正常运行

### 可选准备（根据方案选择）

**经济日历数据：**
- [ ] 安装AKShare库（免费，推荐）
- [ ] 或申请Trading Economics API（$60/月，可选）

**新闻监控：**
- [ ] 注册CryptoPanic API（免费100次/天）

**Twitter监控：**
- [ ] ~~Twitter API Key~~（不需要！太贵）
- [ ] 准备好Nitter实例列表（免费，推荐）
- [ ] 或安装snscrape（免费备用方案）

### API Key获取指南

#### 1. DeepSeek API Key（必须）
```
官网: https://platform.deepseek.com/
费用: 按量付费
  - 输入: ¥1/百万tokens
  - 输出: ¥2/百万tokens
  - 预计月成本: < ¥10（非常便宜）

注册步骤:
1. 访问官网注册账号
2. 实名认证（需要）
3. 充值（最低¥10）
4. 创建API Key
5. 保存到.env文件
```

#### 2. CryptoPanic API Key（推荐）
```
官网: https://cryptopanic.com/developers/api/
费用: 免费100次/天

注册步骤:
1. 注册账号
2. 申请API Key（几分钟内通过）
3. 保存到.env文件
```

#### 3. Binance API（已有）
```
你应该已经有了（实时监控在用）
如果没有: https://www.binance.com/zh-CN/my/settings/api-management
```

### 环境变量配置示例

```bash
# apps/backend/.env

# DeepSeek AI
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxx
DEEPSEEK_API_URL=https://api.deepseek.com/v1

# CryptoPanic新闻
CRYPTOPANIC_API_KEY=xxxxxxxxxxxxxx

# Binance（已有）
BINANCE_API_KEY=xxxxxxxxxxxxxx
BINANCE_SECRET_KEY=xxxxxxxxxxxxxx

# Trading Economics（可选）
# TRADING_ECONOMICS_API_KEY=xxxxxxxxxxxxxx

# Twitter/X监控（使用Nitter RSS，不需要API Key）
NITTER_INSTANCES=https://nitter.net,https://nitter.1d4.us,https://nitter.kavin.rocks
```

---

## 📝 更新日志

### v1.2 (2025-10-15 重大更新)

**新增章节：空投猎人（撸羊毛）系统开发计划**

1. **空投猎人科普（全面解析）**
   - ✅ 核心原理与工作流程（6步法）
   - ✅ 成功案例分析（Uniswap $15k、Arbitrum $8k、ENS $50k）
   - ✅ 100钱包策略详解（$200k潜在收益）

2. **项目发现与筛选**
   - ✅ 4大数据源（Twitter/专业平台/GitHub/AI）
   - ✅ AI驱动项目评分系统（DeepSeek集成）
   - ✅ 当前高潜力项目列表（zkSync/LayerZero/StarkNet等）

3. **Gas费优化策略（核心关键）**
   - ✅ Layer2网络对比与推荐（成本降低90%+）
   - ✅ 低Gas时段策略（UTC 2-6点）
   - ✅ Multicall批量优化（节省93% Gas）

4. **多钱包管理方案**
   - ✅ HD钱包生成（BIP44标准）
   - ✅ 资金分配策略（$15,000初始投入）
   - ✅ MySQL状态监控（2张表设计）

5. **自动化交互引擎**
   - ✅ 4种核心交互类型（DEX/Bridge/LP/NFT）
   - ✅ 反女巫攻击策略（5种随机化方法）
   - ✅ 任务调度系统（Python代码示例）

6. **开发计划与ROI**
   - ✅ 5阶段开发路线图（6-8周完成）
   - ✅ 成本分析（$15,000含循环资金）
   - ✅ 3种收益场景（9倍-39倍ROI）
   - ✅ 风险控制建议

**预期投入**: $15,000  
**预期ROI**: 900%-3900%  
**开发周期**: 6-8周  
**推荐首个项目**: Scroll（新手友好）

---

### v1.1 (2025-10-15 更新)

**核心更新：完善数据源方案**

1. **经济日历数据源确定**
   - ✅ 新增AKShare（免费，包含金十数据日历）
   - ✅ 补充Trading Economics API对比（可选）
   - ✅ 说明FRED API的局限性（无未来日历）

2. **Twitter监控方案优化**
   - ✅ 推荐Nitter RSS（完全免费）
   - ✅ 不推荐Twitter API（太贵，$100/月）
   - ✅ 补充4个备用方案对比

3. **事件筛选规则新增**
   - ✅ 5级重要性分类标准
   - ✅ 5条自动筛选规则（关键词/国家/评级/历史/AI）
   - ✅ 2022-2024历史重大事件整理

4. **成本优化**
   - 完全免费方案：$0/月（AKShare + Nitter RSS + CryptoPanic免费版）
   - 专业方案：仅$60/月（可选Trading Economics）
   - 降低80%以上成本

**最后更新**: 2025-10-15  
**版本**: v1.2  
**维护者**: Sentinel Team

---

## 🎯 立即行动

### 方案A：量化回测系统（原计划）

**数据源已确定，可以开始开发！**

**推荐数据源组合：**
```
✅ 经济日历: AKShare（免费）
✅ 实时新闻: CryptoPanic API（免费100次/天）
✅ Twitter监控: Nitter RSS（完全免费）
✅ 历史数据: Binance API（免费）
✅ AI分析: DeepSeek API（超便宜）

总成本: $0/月
```

**下一步**: 
1. 获取DeepSeek API Key（必须）
2. 注册CryptoPanic API（推荐）
3. 开始实现【阶段一：数据基础建设】

---

### 方案B：空投猎人系统（新增，高ROI）

**立即可以开始！当前是最佳时机！**

**核心优势：**
```
✅ 投入: $15,000（含可循环资金）
✅ 预期ROI: 9倍-39倍（保守-乐观）
✅ 开发周期: 6-8周
✅ 技术门槛: 中等（有Python/Web3基础即可）
✅ 当前高潜力项目: zkSync、LayerZero、StarkNet（未发空投）
```

**第一步（今天就可以做）：**
1. 阅读本文档"空投猎人系统开发计划"章节3遍
2. 注册DeepSeek API（AI评分必须）
3. 准备初始资金$5,000-$15,000
4. 租用VPS服务器（$10/月）

**第二步（本周完成）：**
1. 生成100个HD钱包（使用提供的Python代码）
2. 测试网测试（Goerli/Sepolia）
3. 小规模试运行（10个钱包）

**第三步（下周开始）：**
1. 参与第一个项目：Scroll（新手友好，Gas便宜）
2. 完成基础交互：桥接→Swap→添加流动性
3. 扩展到100个钱包

**为什么现在是最佳时机？**
- zkSync Era 测试网活跃，主网已上线但未发空投（预估单钱包$1000-$5000）
- LayerZero 跨链协议，融资$293M，未发空投（预估$1000-$8000）
- StarkNet Layer2，融资$282M，未发空投（预估$500-$3000）
- 错过这波，下一波可能要等1-2年

---

### 方案C：两者并行（推荐！）

**为什么可以同时做？**

1. **技术栈互补**
   - 回测系统：Python数据分析、回测框架
   - 空投系统：Python Web3.py、智能合约交互
   - 共享：DeepSeek AI、MySQL数据库、监控系统

2. **时间分配**
   - 回测系统：需要持续开发和测试（2-3个月）
   - 空投系统：初期搭建2周，之后每周维护2-3小时

3. **资金互补**
   - 回测系统：几乎不需要资金（只是测试）
   - 空投系统：需要$15,000，但6-12个月后可能回报$150,000+
   - 用空投收益资助实盘量化交易

**建议时间线：**
```
第1-2周: 
  - 空投系统基础搭建（钱包生成、资金分配）
  - 回测系统数据库设计

第3-4周:
  - 空投系统首个项目交互（Scroll）
  - 回测系统历史数据抓取

第5-8周:
  - 空投系统多项目并行（zkSync/LayerZero/StarkNet）
  - 回测系统策略开发

第9-12周:
  - 空投系统持续维护（每周2-3小时）
  - 回测系统AI集成和优化

第3-6个月:
  - 等待空投公告，领取变现
  - 回测系统实盘测试
  - 用空投收益资助实盘交易
```

**最终目标：**
- 空投收益：$150,000-$600,000（6-12个月）
- 量化交易：稳定年化30-50%（使用空投收益作为本金）
- 总资产增长：10倍+

---

有任何问题随时沟通！🚀

**重要提醒：** 空投猎人当前是最佳时机，zkSync/LayerZero等项目窗口期可能只有3-6个月。建议优先启动空投系统！

