#!/bin/bash

# 前台运行前端，显示实时日志

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════╗"
echo "║     🌐 启动前端服务（前台模式）               ║"
echo "╚════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

cd "$(dirname "$0")"

# 清理5173端口
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  清理端口 5173...${NC}"
    lsof -ti:5173 | xargs kill -9 2>/dev/null
    sleep 1
fi

echo -e "${GREEN}✅ 端口已清理${NC}"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🌐 前端服务启动中...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}💡 提示: 按 Ctrl+C 停止服务${NC}"
echo ""

# 前台运行，显示实时日志
cd /Users/qiuzhiyang/Desktop/bn/crypto-sentinel
pnpm --filter frontend dev

