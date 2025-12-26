#!/bin/bash

# 颜色定义
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║           🔄  重启 Crypto Sentinel 服务                   ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

cd "$(dirname "$0")"

# 先停止所有服务
./stop-all.sh

echo ""
echo "等待 3 秒后重新启动..."
sleep 3
echo ""

# 重新启动
./start-all.sh

