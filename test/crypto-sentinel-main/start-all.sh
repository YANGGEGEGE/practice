#!/bin/bash

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# 清屏
clear

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║           🚀  Crypto Sentinel 一键启动                    ║"
echo "║              加密货币监控与交易系统                        ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# 切换到项目目录
cd "$(dirname "$0")"
PROJECT_DIR=$(pwd)

print_info "项目目录: $PROJECT_DIR"
echo ""

# 检查环境变量文件
if [ ! -f "apps/backend/.env" ]; then
    print_error "未找到环境变量文件"
    print_info "正在创建 .env 文件..."
    cp apps/backend/env.example apps/backend/.env
    print_warning "请编辑 apps/backend/.env 配置你的 API 密钥"
    exit 1
fi

print_success "环境变量配置已就绪"
echo ""

# 第1步: 检查并启动 Docker 服务
print_info "【第1步】检查 Docker 服务..."
if ! docker ps &> /dev/null; then
    print_error "Docker 未运行，请先启动 Docker"
    exit 1
fi

# 检查容器状态
if ! docker-compose ps | grep -q "Up"; then
    print_info "正在启动 MySQL 和 Redis..."
    docker-compose up -d mysql redis
    
    print_info "等待数据库启动（30秒）..."
    for i in {30..1}; do
        printf "\r等待中... ${i}秒 "
        sleep 1
    done
    echo ""
    print_success "数据库服务已启动"
else
    print_success "Docker 服务已运行"
fi
echo ""

# 第2步: 启动后端服务
print_info "【第2步】启动后端服务..."

# 检查后端是否已经运行
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    print_warning "端口 3000 已被占用，正在停止旧服务..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    sleep 2
fi

# 设置代理环境变量
export https_proxy=http://127.0.0.1:7897
export HTTPS_PROXY=http://127.0.0.1:7897

# 启动后端（后台运行）
print_info "正在启动后端服务（后台运行）..."
cd "$PROJECT_DIR"
pnpm --filter backend dev > logs/backend.log 2>&1 &
BACKEND_PID=$!

# 等待后端启动
print_info "等待后端启动（15秒）..."
for i in {15..1}; do
    printf "\r等待中... ${i}秒 "
    sleep 1
    
    # 检查后端是否已经启动
    if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
        echo ""
        print_success "后端服务已启动"
        break
    fi
done
echo ""

# 验证后端是否成功启动
if ! curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    print_error "后端启动失败，请查看日志: logs/backend.log"
    exit 1
fi

# 第3步: 启动前端服务
print_info "【第3步】启动前端服务..."

# 检查前端是否已经运行
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null ; then
    print_warning "端口 5173 已被占用，正在停止旧服务..."
    lsof -ti:5173 | xargs kill -9 2>/dev/null
    sleep 2
fi

# 启动前端（后台运行）
print_info "正在启动前端服务（后台运行）..."
cd "$PROJECT_DIR"
pnpm --filter frontend dev > logs/frontend.log 2>&1 &
FRONTEND_PID=$!

# 等待前端启动
print_info "等待前端启动（10秒）..."
for i in {10..1}; do
    printf "\r等待中... ${i}秒 "
    sleep 1
    
    # 检查前端是否已经启动
    if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo ""
        print_success "前端服务已启动"
        break
    fi
done
echo ""

# 验证前端是否成功启动
if ! lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
    print_error "前端启动失败，请查看日志: logs/frontend.log"
    exit 1
fi

# 启动完成
echo ""
echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║                 🎉  启动完成！                            ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

print_success "所有服务已成功启动！"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 服务访问地址："
echo ""
echo "  🌐 前端界面:        http://localhost:5173"
echo "  🔧 后端 API:        http://localhost:3000"
echo "  💊 健康检查:        http://localhost:3000/api/health"
echo "  📈 GraphQL:         http://localhost:3000/graphql"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🗄️  数据库服务："
echo ""
echo "  🐬 MySQL:           localhost:3306"
echo "  🔴 Redis:           localhost:6379"
echo "  🔧 MySQL管理:       docker-compose up -d adminer"
echo "                     访问 http://localhost:8080"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 监控状态："
echo ""
echo "  💰 现货监控:        运行中（BTC实时价格）"
echo "  📊 合约监控:        运行中（监控 16 个持仓）"
echo "  🔔 Bark推送:        已配置"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚙️  管理命令："
echo ""
echo "  查看后端日志:      tail -f logs/backend.log"
echo "  查看前端日志:      tail -f logs/frontend.log"
echo "  停止所有服务:      ./stop-all.sh"
echo "  重启服务:          ./restart-all.sh"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 提示："
echo ""
echo "  - 所有服务运行在后台，关闭终端不会停止服务"
echo "  - 按 Ctrl+C 不会停止服务"
echo "  - 使用 ./stop-all.sh 停止所有服务"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

print_info "后端进程 PID: $BACKEND_PID"
print_info "前端进程 PID: $FRONTEND_PID"
echo ""

# 保存 PID 到文件
mkdir -p .pids
echo $BACKEND_PID > .pids/backend.pid
echo $FRONTEND_PID > .pids/frontend.pid

print_success "现在可以打开浏览器访问 http://localhost:5173"
echo ""

