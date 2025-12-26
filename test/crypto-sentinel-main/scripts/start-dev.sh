#!/bin/bash

echo "🚀 Crypto Sentinel - 快速启动（开发模式）"
echo "================================"
echo ""

# 检查环境变量
if [ ! -f "apps/backend/.env" ]; then
    echo "❌ 未找到环境变量文件: apps/backend/.env"
    echo "请先运行: cp apps/backend/env.example apps/backend/.env"
    exit 1
fi

echo "✅ 环境变量配置正常"
echo ""
echo "注意: 请确保本地已安装并启动 MySQL 和 Redis"
echo ""
echo "📦 MySQL 配置:"
echo "  - Host: localhost:3306"
echo "  - Database: crypto_sentinel"
echo "  - 如未创建数据库，请运行: mysql -uroot -p -e 'CREATE DATABASE crypto_sentinel;'"
echo ""
echo "📦 Redis 配置:"
echo "  - Host: localhost:6379"
echo "  - 如未启动，请运行: redis-server"
echo ""
echo "================================"
echo ""
echo "下一步："
echo ""
echo "终端1 - 启动后端:"
echo "  cd apps/backend && pnpm dev"
echo ""
echo "终端2 - 启动前端:"
echo "  cd apps/frontend && pnpm dev"
echo ""
echo "然后访问: http://localhost:5173"
echo ""

