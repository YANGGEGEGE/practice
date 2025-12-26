# 📁 项目结构说明

```
crypto-sentinel/
├── apps/
│   ├── backend/                    # NestJS后端
│   │   ├── src/
│   │   │   ├── main.ts            # 应用入口
│   │   │   ├── app.module.ts      # 根模块
│   │   │   ├── app.controller.ts  # 根控制器
│   │   │   ├── app.service.ts     # 根服务
│   │   │   │
│   │   │   ├── config/            # 配置模块
│   │   │   │   ├── configuration.ts      # 配置定义
│   │   │   │   └── database.config.ts    # 数据库配置
│   │   │   │
│   │   │   ├── database/          # 数据库相关
│   │   │   │   ├── entities/              # 实体类
│   │   │   │   │   ├── price-history.entity.ts
│   │   │   │   │   └── alert-history.entity.ts
│   │   │   │   └── data-source.ts         # TypeORM数据源
│   │   │   │
│   │   │   └── modules/           # 业务模块
│   │   │       ├── monitor/       # 监控模块
│   │   │       │   ├── monitor.module.ts
│   │   │       │   ├── monitor.controller.ts
│   │   │       │   └── services/
│   │   │       │       ├── monitor.service.ts           # 监控服务
│   │   │       │       ├── binance-ws.service.ts        # 币安WebSocket
│   │   │       │       └── volatility-detector.service.ts # 波动检测
│   │   │       │
│   │   │       └── alert/         # 告警模块
│   │   │           ├── alert.module.ts
│   │   │           ├── alert.controller.ts
│   │   │           └── services/
│   │   │               ├── alert.service.ts   # 告警服务
│   │   │               └── bark.service.ts    # Bark推送
│   │   │
│   │   ├── package.json           # 后端依赖
│   │   ├── tsconfig.json          # TypeScript配置
│   │   ├── nest-cli.json          # NestJS CLI配置
│   │   └── env.example            # 环境变量模板
│   │
│   └── frontend/                   # React前端
│       ├── src/
│       │   ├── main.tsx           # 应用入口
│       │   ├── App.tsx            # 根组件
│       │   │
│       │   ├── pages/             # 页面组件
│       │   │   └── Dashboard/             # 仪表盘页面
│       │   │       ├── index.tsx
│       │   │       └── index.css
│       │   │
│       │   ├── services/          # API服务
│       │   │   └── api.ts                 # API封装
│       │   │
│       │   ├── components/        # 公共组件（待扩展）
│       │   ├── stores/            # 状态管理（待扩展）
│       │   ├── hooks/             # 自定义Hooks（待扩展）
│       │   ├── utils/             # 工具函数（待扩展）
│       │   └── types/             # TypeScript类型（待扩展）
│       │
│       ├── index.html             # HTML模板
│       ├── package.json           # 前端依赖
│       ├── vite.config.ts         # Vite配置
│       └── tsconfig.json          # TypeScript配置
│
├── docker/                         # Docker配置
│   └── mysql/
│       └── init.sql               # MySQL初始化脚本
│
├── scripts/                        # 脚本工具
│   ├── setup.sh                   # 一键安装
│   ├── start.sh                   # 启动服务
│   └── stop.sh                    # 停止服务
│
├── docker-compose.yml             # Docker Compose配置
├── pnpm-workspace.yaml            # pnpm工作区配置
├── package.json                   # 根package.json
├── README.md                      # 项目README
├── QUICKSTART.md                  # 快速启动指南
├── PROJECT_STRUCTURE.md           # 本文件
└── .gitignore                     # Git忽略规则
```

---

## 核心模块说明

### 后端模块

#### 1. Monitor Module（监控模块）
- **职责**: 实时监控加密货币价格，检测异常波动
- **核心服务**:
  - `BinanceWsService`: 维护与币安WebSocket的连接
  - `VolatilityDetectorService`: 分析价格历史，计算波动率
  - `MonitorService`: 协调监控流程，触发告警

#### 2. Alert Module（告警模块）
- **职责**: 发送各类告警通知
- **核心服务**:
  - `BarkService`: 封装Bark API调用
  - `AlertService`: 告警业务逻辑，支持不同级别告警

### 前端模块

#### 1. Dashboard Page（仪表盘页面）
- **功能**:
  - 显示系统运行状态
  - 实时显示BTC价格
  - 测试Bark推送
  - 快速开始指南

---

## 数据流向

```
币安API (WebSocket)
    ↓
BinanceWsService (接收实时数据)
    ↓
MonitorService (处理价格更新)
    ↓
VolatilityDetectorService (计算波动率)
    ↓
[波动 > 10%?]
    ↓ Yes
AlertService (生成告警)
    ↓
BarkService (发送推送)
    ↓
iPhone (接收通知)
```

---

## 扩展点

### 后端可扩展模块（未来）

```
modules/
├── monitor/        ✅ 已实现
├── alert/          ✅ 已实现
├── analysis/       📅 AI分析模块（待开发）
├── scraper/        📅 新闻爬虫模块（待开发）
├── trading/        📅 交易模块（待开发）
├── strategy/       📅 策略引擎（待开发）
└── user/           📅 用户管理（待开发）
```

### 前端可扩展页面（未来）

```
pages/
├── Dashboard/      ✅ 已实现
├── Monitor/        📅 详细监控页（待开发）
├── Events/         📅 事件中心页（待开发）
├── Settings/       📅 设置页（待开发）
├── Trading/        📅 交易页（待开发）
└── Analytics/      📅 分析页（待开发）
```

---

## 配置文件说明

### apps/backend/.env
```env
# 必须配置
BARK_KEY=xxx              # Bark推送密钥

# 可选配置
DB_HOST=localhost         # 数据库地址
DB_PORT=3306             # 数据库端口
DB_USERNAME=root         # 数据库用户名
DB_PASSWORD=xxx          # 数据库密码
REDIS_HOST=localhost     # Redis地址
REDIS_PORT=6379          # Redis端口
VOLATILITY_THRESHOLD=10  # 波动阈值(%)
```

---

## 端口使用

| 服务 | 端口 | 说明 |
|------|------|------|
| 后端API | 3000 | NestJS应用 |
| 前端 | 5173 | Vite开发服务器 |
| MySQL | 3306 | 数据库 |
| Redis | 6379 | 缓存/队列 |
| Adminer | 8080 | MySQL管理界面（可选） |
| Redis Commander | 8081 | Redis管理界面（可选） |

---

## 技术栈总览

### 后端
- **框架**: NestJS 10.x
- **语言**: TypeScript 5.x
- **数据库**: MySQL 8.x
- **缓存**: Redis 7.x
- **ORM**: TypeORM
- **API**: REST + GraphQL
- **WebSocket**: Socket.io + ws

### 前端
- **框架**: React 18
- **语言**: TypeScript 5.x
- **构建**: Vite 5.x
- **UI**: Ant Design 5.x
- **状态**: Zustand + TanStack Query
- **图表**: ECharts

### 基础设施
- **容器**: Docker + Docker Compose
- **包管理**: pnpm
- **进程管理**: PM2（可选）
- **日志**: Winston

---

## 下一步开发建议

1. **优先级1 - 核心功能增强**
   - 支持更多币种监控
   - 添加多个时间框架分析（5m, 15m, 1h）
   - 实现告警历史记录和查询

2. **优先级2 - AI集成**
   - 集成Claude API
   - 自动分析价格异动原因
   - 新闻情绪分析

3. **优先级3 - 数据源扩展**
   - CoinGlass API集成
   - Twitter舆情监控
   - 新闻爬虫

4. **优先级4 - 交易功能**
   - 模拟交易系统
   - 策略回测引擎
   - 实盘交易接口

---

## 性能优化建议

### 数据库优化
- 价格历史表按月分表
- 添加合适的索引
- 定期归档历史数据

### Redis优化
- 使用Redis缓存热点价格
- 用Redis Stream处理实时数据
- 合理设置过期时间

### 前端优化
- 虚拟滚动（大量数据）
- 图表懒加载
- WebSocket自动重连

---

🎯 **这个架构设计充分考虑了未来扩展性，可以逐步添加新功能而不需要重构！**

