#!/bin/bash

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🚀 启动后端服务...${NC}"
echo ""

cd "$(dirname "$0")"

# 1. 清理3000端口
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  清理端口 3000...${NC}"
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    sleep 1
fi

# 2. 设置代理
export https_proxy=http://127.0.0.1:7897
export HTTPS_PROXY=http://127.0.0.1:7897

# 3. 启动后端
echo -e "${BLUE}ℹ️  正在启动后端...${NC}"
pnpm --filter backend dev > logs/backend.log 2>&1 &
BACKEND_PID=$!

# 4. 快速检测（最多等待10秒）
echo -e "${BLUE}ℹ️  等待服务就绪...${NC}"
for i in {1..10}; do
    if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
        echo ""
        echo -e "${GREEN}✅ 后端服务启动成功！${NC}"
        echo ""
        echo "📊 后端地址: http://localhost:3000"
        echo "💊 健康检查: http://localhost:3000/api/health"
        echo "📝 查看日志: tail -f logs/backend.log"
        echo "🛑 停止服务: ./stop-all.sh"
        echo ""
        exit 0
    fi
    sleep 1
    printf "."
done

echo ""
echo -e "${YELLOW}⚠️  后端可能需要更多时间启动${NC}"
echo "📝 查看日志: tail -f logs/backend.log"
echo ""

