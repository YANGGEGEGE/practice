#!/bin/bash

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║           🛑  停止 Crypto Sentinel 服务                   ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

cd "$(dirname "$0")"

# 停止前端服务
print_info "停止前端服务..."
if lsof -ti:5173 >/dev/null 2>&1; then
    lsof -ti:5173 | xargs kill -9 2>/dev/null
    print_success "前端服务已停止"
else
    print_info "前端服务未运行"
fi

# 停止后端服务
print_info "停止后端服务..."
if lsof -ti:3000 >/dev/null 2>&1; then
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    print_success "后端服务已停止"
else
    print_info "后端服务未运行"
fi

# 停止 nest 进程
print_info "清理后台进程..."
pkill -9 -f "nest.js start" 2>/dev/null
pkill -9 -f "pnpm.*dev" 2>/dev/null

# 清理 PID 文件
rm -rf .pids 2>/dev/null

echo ""
print_success "所有服务已停止"
echo ""
print_info "如需停止 Docker 服务，请运行："
echo "  docker-compose stop"
echo ""

