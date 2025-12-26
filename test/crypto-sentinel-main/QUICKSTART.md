# 🚀 快速启动指南

## 前置要求

确保已安装以下软件：

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0  
- **Docker** 和 **Docker Compose**

### 安装pnpm（如果还没有）

```bash
npm install -g pnpm
```

---

## 第一步：克隆并安装依赖

```bash
# 进入项目目录
cd crypto-sentinel

# 安装所有依赖（首次运行可能需要5-10分钟）
pnpm install
```

---

## 第二步：配置环境变量

### 1. 配置后端环境变量

```bash
# 复制环境变量模板
cp apps/backend/env.example apps/backend/.env

# 编辑.env文件
nano apps/backend/.env  # 或使用你喜欢的编辑器
```

### 2. 必须配置的环境变量

```env
# Bark推送配置（iPhone通知）
BARK_KEY=your_bark_key_here   # 从Bark App获取

# 其他配置可以保持默认
```

### 3. 如何获取Bark Key？

1. 在iPhone上下载并安装 **Bark** App（App Store免费）
2. 打开Bark，会自动生成一个Key
3. 复制这个Key到`.env`文件的`BARK_KEY`

---

## 第三步：启动数据库服务

```bash
# 启动MySQL和Redis
docker-compose up -d mysql redis

# 查看服务状态
docker-compose ps

# 查看日志（可选）
docker-compose logs -f mysql redis
```

**等待30秒**，让MySQL完成初始化。

---

## 第四步：启动后端服务

```bash
# 在项目根目录执行
pnpm --filter backend dev
```

你应该看到：

```
✅ Application is running on: http://localhost:3000
📊 GraphQL Playground: http://localhost:3000/graphql
💊 Health Check: http://localhost:3000/api/health
```

**保持这个终端运行**。

---

## 第五步：启动前端服务

打开**新的终端窗口**：

```bash
# 进入项目目录
cd crypto-sentinel

# 启动前端
pnpm --filter frontend dev
```

你应该看到：

```
VITE v5.x.x ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## 第六步：访问和测试

### 1. 打开浏览器

访问：http://localhost:5173

你会看到：
- 🎯 系统状态（监控中/已停止）
- 💰 BTC实时价格（从币安WebSocket获取）
- 🧪 功能测试按钮

### 2. 测试Bark推送

点击页面上的 **"发送测试通知"** 按钮。

✅ 如果配置正确，你的iPhone会收到一条通知！

### 3. 测试价格监控

系统会自动监控BTC价格：
- 当1分钟内波动超过10%时
- 会自动发送告警到你的iPhone
- 声音：闹钟（alarm）

---

## 常见问题

### Q1: 后端启动失败，提示数据库连接错误

**解决方案：**

```bash
# 检查MySQL是否启动
docker-compose ps

# 如果MySQL未启动
docker-compose up -d mysql

# 查看MySQL日志
docker-compose logs mysql
```

### Q2: 前端显示"连接币安WebSocket中..."一直不消失

**可能原因：**
1. 后端未启动
2. 网络问题（无法访问币安）

**解决方案：**

```bash
# 检查后端是否正常运行
curl http://localhost:3000/api/health

# 检查后端日志，查看WebSocket连接状态
```

### Q3: 点击"发送测试通知"没反应

**可能原因：**
1. BARK_KEY未配置或错误
2. 网络无法访问Bark API

**解决方案：**

```bash
# 检查.env文件
cat apps/backend/.env | grep BARK_KEY

# 查看后端日志，看是否有错误信息
```

### Q4: iPhone没收到通知

**检查清单：**
1. ✅ Bark App已安装并打开过
2. ✅ BARK_KEY配置正确
3. ✅ iPhone联网
4. ✅ 后端日志显示"✅ Bark notification sent successfully"
5. ✅ iPhone通知权限已开启

---

## 管理工具（可选）

### 访问数据库管理界面

```bash
# 启动Adminer（MySQL管理界面）
docker-compose up -d adminer

# 访问 http://localhost:8080
# 服务器: mysql
# 用户名: root
# 密码: crypto_sentinel_2024
# 数据库: crypto_sentinel
```

### 访问Redis管理界面

```bash
# 启动Redis Commander
docker-compose up -d redis-commander

# 访问 http://localhost:8081
```

---

## 停止服务

### 停止后端和前端

在各自的终端按 `Ctrl + C`

### 停止数据库

```bash
# 停止但保留数据
docker-compose stop

# 停止并删除容器（数据保留在volume中）
docker-compose down

# 停止并删除所有数据（谨慎！）
docker-compose down -v
```

---

## 下一步

恭喜！🎉 系统已经运行起来了。

### 后续功能开发：

1. **添加更多币种监控**
   - 修改 `apps/backend/src/modules/monitor/services/monitor.service.ts`
   - 将 `defaultSymbols` 改为 `['btcusdt', 'ethusdt', 'solusdt']`

2. **集成AI分析**
   - 配置 `CLAUDE_API_KEY`
   - 添加AI分析模块

3. **添加新闻爬虫**
   - 实现CoinDesk、CoinTelegraph爬虫
   - 结合AI进行舆情分析

4. **开发交易功能**
   - 集成币安交易API
   - 实现策略引擎
   - 回测系统

---

## 需要帮助？

- 查看项目README: `README.md`
- 查看架构文档: `docs/ARCHITECTURE.md`
- 提交Issue: GitHub Issues

---

## 性能优化建议

### Mac本地部署

如果在Mac上长期运行：

1. **防止Mac休眠**
   ```
   系统设置 → 电池 → 永不休眠
   ```

2. **使用PM2管理进程**
   ```bash
   # 安装PM2
   npm install -g pm2

   # 启动后端
   cd apps/backend
   pm2 start dist/main.js --name crypto-backend

   # 启动前端（生产构建）
   cd apps/frontend
   pnpm build
   pm2 serve dist 5173 --name crypto-frontend

   # 查看状态
   pm2 status

   # 设置开机启动
   pm2 startup
   pm2 save
   ```

3. **监控资源使用**
   ```bash
   # 查看Docker容器资源
   docker stats

   # 查看进程资源
   pm2 monit
   ```

---

🎉 **享受你的加密货币监控系统！**

