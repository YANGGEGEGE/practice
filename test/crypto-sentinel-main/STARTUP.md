# 🚀 Crypto Sentinel 启动指南

## 📋 前置要求

确保已安装：
- ✅ Docker Desktop (已安装并运行中)
- ✅ Node.js >= 18.0.0
- ✅ pnpm >= 8.0.0

## 🎯 启动方式（三选一）

### 方式1：快速启动（推荐）⚡

```bash
./quick-start.sh
```

**特点：**
- ✅ 自动清理端口冲突
- ✅ 快速启动（仅等待10秒）
- ✅ 适合开发环境
- ⚠️ 假设 Docker 已经在运行

### 方式2：分步启动（灵活）

```bash
# 先启动后端
./start-backend.sh

# 等后端就绪后，再启动前端（新终端）
./start-frontend.sh
```

**特点：**
- ✅ 可以分别查看实时日志
- ✅ 更灵活的控制
- ✅ 适合开发调试

### 方式3：完整启动（首次使用）

```bash
./start-all.sh
```

**特点：**
- ✅ 自动检查并启动 Docker
- ✅ 等待数据库完全就绪
- ⚠️ 启动时间较长（约45秒）

**启动完成后访问：** http://localhost:5173

---

## 🛑 停止服务

```bash
./stop-all.sh
```

停止所有前后端服务（不停止 Docker）

---

## 🔄 重启服务

```bash
./restart-all.sh
```

重启前后端服务

---

## 📊 服务访问地址

| 服务 | 地址 | 说明 |
|------|------|------|
| **前端界面** | http://localhost:5173 | 主界面 |
| **后端 API** | http://localhost:3000 | REST API |
| **健康检查** | http://localhost:3000/api/health | 后端状态 |
| **GraphQL** | http://localhost:3000/graphql | GraphQL 接口 |
| **MySQL** | localhost:3306 | 数据库 |
| **Redis** | localhost:6379 | 缓存 |

---

## 📝 查看日志

### 后端日志
```bash
tail -f logs/backend.log
```

### 前端日志
```bash
tail -f logs/frontend.log
```

### Docker 日志
```bash
docker-compose logs -f mysql redis
```

---

## 🔧 手动启动（多终端方式）

如果需要在不同终端中查看实时日志：

### 终端 1 - 启动 Docker 服务
```bash
docker-compose up mysql redis
```

### 终端 2 - 启动后端
```bash
export https_proxy=http://127.0.0.1:7897
export HTTPS_PROXY=http://127.0.0.1:7897
pnpm --filter backend dev
```

### 终端 3 - 启动前端
```bash
pnpm --filter frontend dev
```

---

## 🎮 常用命令

### 查看运行状态
```bash
# 检查端口占用
lsof -i :3000  # 后端
lsof -i :5173  # 前端
lsof -i :3306  # MySQL
lsof -i :6379  # Redis

# 查看 Docker 容器状态
docker-compose ps
```

### 测试功能
```bash
# 测试后端健康状态
curl http://localhost:3000/api/health

# 测试 Bark 推送
curl -X POST http://localhost:3000/api/alert/test

# 查看合约持仓
curl http://localhost:3000/api/monitor/futures/positions

# 查看合约监控状态
curl http://localhost:3000/api/monitor/futures/status
```

### 管理 Docker 服务
```bash
# 启动所有 Docker 服务
docker-compose up -d

# 启动特定服务
docker-compose up -d mysql redis

# 停止服务
docker-compose stop

# 查看日志
docker-compose logs -f mysql

# 删除所有容器和数据（谨慎！）
docker-compose down -v
```

---

## ⚙️ 环境配置

配置文件位置：`apps/backend/.env`

主要配置项：
```env
# 币安API（必须）
BINANCE_API_KEY=你的API密钥
BINANCE_SECRET_KEY=你的密钥

# Bark推送（必须）
BARK_KEY=你的Bark密钥

# 数据库
DB_PASSWORD=crypto_sentinel_2024

# 监控配置
FUTURES_MONITOR_INTERVAL=10000          # 检查间隔（毫秒）
FUTURES_PRICE_DROP_THRESHOLD=5          # 跌幅阈值（%）
FUTURES_TIMEFRAME=300000                # 时间窗口（5分钟）
```

---

## 🚨 故障排除

### 问题：端口被占用
```bash
# 查找占用进程
lsof -ti:3000 | xargs kill -9  # 杀死后端进程
lsof -ti:5173 | xargs kill -9  # 杀死前端进程
```

### 问题：Docker 无法启动
```bash
# 重启 Docker Desktop
# 或检查 Docker 服务状态
docker ps
```

### 问题：数据库连接失败
```bash
# 检查 MySQL 是否启动
docker-compose ps mysql

# 查看 MySQL 日志
docker-compose logs mysql

# 重启 MySQL
docker-compose restart mysql
```

### 问题：合约监控失败
```bash
# 检查 API 配置
cat apps/backend/.env | grep BINANCE

# 测试合约 API
curl http://localhost:3000/api/monitor/futures/positions
```

---

## 💡 提示

1. **首次启动** 建议使用 `./start-all.sh`，会自动等待数据库就绪
2. **开发调试** 时可以用多终端方式，方便查看实时日志
3. **生产部署** 建议使用 PM2 管理进程
4. **服务后台运行** 使用 `./start-all.sh` 后关闭终端不影响服务

---

## 📱 功能特性

- ✅ 实时监控 BTC 价格
- ✅ 自动监控 16 个合约持仓
- ✅ 5分钟跌幅 5% 自动告警
- ✅ iPhone Bark 推送通知
- ✅ 支持多个币种同时监控
- ✅ 实时盈亏显示

---

## 🎉 开始使用

1. 运行 `./start-all.sh`
2. 打开浏览器访问 http://localhost:5173
3. 点击"发送测试通知"测试 Bark 推送
4. 系统会自动监控你的合约持仓

**祝你交易愉快！🚀**

