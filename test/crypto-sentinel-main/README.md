# Crypto Sentinel 🪙

加密货币监控与交易系统

## 项目简介

实时监控加密货币价格波动，智能AI分析市场动态，iPhone强制提醒重要事件。未来支持自动交易、策略回测等功能。

## 技术栈

### 后端
- **框架**: NestJS 10.x + TypeScript 5.x
- **数据库**: MySQL 8.x + Redis 7.x
- **ORM**: TypeORM
- **消息队列**: Bull (基于Redis)
- **WebSocket**: Socket.io
- **日志**: Winston

### 前端
- **框架**: React 18 + TypeScript 5.x
- **构建工具**: Vite 5.x
- **UI组件**: Ant Design 5.x
- **图表**: ECharts 5.x
- **状态管理**: Zustand + TanStack Query
- **实时通信**: Socket.io-client + GraphQL-WS

### 外部服务
- 币安API（价格数据 + 未来交易）
- Claude API（AI分析）
- Bark（iPhone推送）
- CoinGlass API（衍生品数据）

## 项目结构

```
crypto-sentinel/
├── apps/
│   ├── backend/          # NestJS后端
│   └── frontend/         # React前端
├── packages/             # 共享包
│   ├── types/           # 共享类型
│   ├── utils/           # 共享工具
│   └── constants/       # 共享常量
├── docker/              # Docker配置
└── scripts/             # 脚本工具
```

## 快速开始

### 前置要求
- Node.js >= 18.x
- pnpm >= 8.x
- Docker & Docker Compose
- MySQL 8.x
- Redis 7.x

### 安装依赖
```bash
pnpm install
```

### 配置环境变量
复制 `.env.example` 到 `.env` 并填写配置：
```bash
cp apps/backend/.env.example apps/backend/.env
```

### 启动开发环境
```bash
# 启动数据库服务
docker-compose up -d mysql redis

# 启动后端
pnpm --filter backend dev

# 启动前端
pnpm --filter frontend dev
```

### 访问应用
- 前端: http://localhost:5173
- 后端: http://localhost:3000
- GraphQL Playground: http://localhost:3000/graphql

## 功能模块

### ✅ 当前功能（Demo）
- [x] 币安实时价格监控
- [x] 价格波动检测（>10%）
- [x] Bark推送到iPhone
- [x] 基础Dashboard展示

### 🚧 开发中（MVP）
- [ ] 多币种监控
- [ ] AI智能分析
- [ ] 新闻爬虫
- [ ] 事件中心

### 📅 计划中（未来）
- [ ] 模拟交易
- [ ] 策略引擎
- [ ] 回测系统
- [ ] 实盘交易
- [ ] 薅羊毛工具
- [ ] 打土狗功能

## 开发指南

### 后端开发
```bash
cd apps/backend

# 运行开发服务器
pnpm dev

# 运行测试
pnpm test

# 生成迁移
pnpm migration:generate

# 运行迁移
pnpm migration:run
```

### 前端开发
```bash
cd apps/frontend

# 运行开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 运行测试
pnpm test
```

## 部署

### Docker部署
```bash
# 构建并启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f
```

### 本地部署（Mac）
```bash
# 使用PM2管理进程
pnpm pm2:start

# 查看进程状态
pnpm pm2:status
```

## 贡献指南

欢迎提交Issue和Pull Request！

## 许可证

MIT

## 联系方式

有问题请提Issue

