#!/bin/bash

# 快速启动版本 - 无需等待数据库，适合开发环境

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

clear
echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════╗"
echo "║    🚀  Crypto Sentinel 快速启动               ║"
echo "╚═══════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

cd "$(dirname "$0")"

# 检查 Docker 是否运行（不等待）
if docker ps &> /dev/null; then
    echo -e "${GREEN}✅ Docker 正在运行${NC}"
else
    echo -e "${YELLOW}⚠️  Docker 未运行，请先启动 Docker${NC}"
    exit 1
fi

# 1. 清理端口
echo ""
echo -e "${BLUE}【1/3】清理端口...${NC}"
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    echo "  • 清理 3000 端口"
fi
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
    lsof -ti:5173 | xargs kill -9 2>/dev/null
    echo "  • 清理 5173 端口"
fi
pkill -9 -f "nest.js start" 2>/dev/null
sleep 1

# 2. 启动后端
echo ""
echo -e "${BLUE}【2/3】启动后端服务...${NC}"
export https_proxy=http://127.0.0.1:7897
export HTTPS_PROXY=http://127.0.0.1:7897
pnpm --filter backend dev > logs/backend.log 2>&1 &

# 快速等待（只等5秒）
for i in {5..1}; do
    printf "\r  等待 ${i} 秒..."
    sleep 1
done
echo ""

# 3. 启动前端
echo ""
echo -e "${BLUE}【3/3】启动前端服务...${NC}"
pnpm --filter frontend dev > logs/frontend.log 2>&1 &

# 快速等待（只等5秒）
for i in {5..1}; do
    printf "\r  等待 ${i} 秒..."
    sleep 1
done
echo ""

# 显示结果
echo ""
echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════════╗"
echo "║           ✅  启动完成！                       ║"
echo "╚═══════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 服务地址："
echo "  🌐 前端: http://localhost:5173"
echo "  🔧 后端: http://localhost:3000"
echo ""
echo "📝 查看日志："
echo "  • 后端: tail -f logs/backend.log"
echo "  • 前端: tail -f logs/frontend.log"
echo ""
echo "🛑 停止服务:"
echo "  ./stop-all.sh"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${YELLOW}💡 提示: 如果服务未就绪，请等待10-15秒后访问${NC}"
echo ""

