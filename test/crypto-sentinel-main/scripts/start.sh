#!/bin/bash

echo "🚀 Crypto Sentinel - 启动脚本"
echo "================================"
echo ""

# 检查环境变量
if [ ! -f "apps/backend/.env" ]; then
    echo "❌ 未找到环境变量文件: apps/backend/.env"
    echo "请先运行: ./scripts/setup.sh"
    exit 1
fi

# 启动数据库服务
echo "📦 启动MySQL和Redis..."
docker-compose up -d mysql redis

if [ $? -ne 0 ]; then
    echo "❌ 数据库启动失败"
    exit 1
fi

echo "✅ 数据库启动成功"
echo "⏳ 等待MySQL初始化（30秒）..."
sleep 30

# 检查数据库是否就绪
echo "🔍 检查MySQL连接..."
docker-compose exec -T mysql mysql -uroot -pcrypto_sentinel_2024 -e "SELECT 1;" > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "⚠️  MySQL可能还未完全就绪，请稍后手动启动后端"
else
    echo "✅ MySQL就绪"
fi

echo ""
echo "================================"
echo "✨ 数据库启动完成！"
echo ""
echo "下一步："
echo ""
echo "终端1 - 启动后端:"
echo "  pnpm --filter backend dev"
echo ""
echo "终端2 - 启动前端:"
echo "  pnpm --filter frontend dev"
echo ""
echo "然后访问: http://localhost:5173"
echo ""

