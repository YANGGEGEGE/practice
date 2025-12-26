#!/bin/bash

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🌐 启动前端服务...${NC}"
echo ""

cd "$(dirname "$0")"

# 1. 清理5173端口
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  清理端口 5173...${NC}"
    lsof -ti:5173 | xargs kill -9 2>/dev/null
    sleep 1
fi

# 2. 启动前端
echo -e "${BLUE}ℹ️  正在启动前端...${NC}"
pnpm --filter frontend dev > logs/frontend.log 2>&1 &
FRONTEND_PID=$!

# 3. 快速检测（最多等待8秒）
echo -e "${BLUE}ℹ️  等待服务就绪...${NC}"
for i in {1..8}; do
    if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo ""
        echo -e "${GREEN}✅ 前端服务启动成功！${NC}"
        echo ""
        echo "🌐 前端地址: http://localhost:5173"
        echo "📝 查看日志: tail -f logs/frontend.log"
        echo "🛑 停止服务: ./stop-all.sh"
        echo ""
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${GREEN}🎉 可以打开浏览器访问了！${NC}"
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        exit 0
    fi
    sleep 1
    printf "."
done

echo ""
echo -e "${YELLOW}⚠️  前端可能需要更多时间启动${NC}"
echo "📝 查看日志: tail -f logs/frontend.log"
echo ""

