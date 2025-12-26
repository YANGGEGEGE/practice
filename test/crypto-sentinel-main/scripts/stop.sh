#!/bin/bash

echo "🛑 Crypto Sentinel - 停止脚本"
echo "================================"
echo ""

echo "停止Docker服务..."
docker-compose stop

if [ $? -eq 0 ]; then
    echo "✅ 服务已停止"
else
    echo "❌ 停止失败"
    exit 1
fi

echo ""
echo "容器状态:"
docker-compose ps
echo ""

