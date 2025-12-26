#!/bin/bash

echo "🚀 Crypto Sentinel - 一键安装脚本"
echo "================================"
echo ""

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js未安装，请先安装Node.js >= 18.0.0"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js版本过低，需要 >= 18.0.0，当前版本: $(node -v)"
    exit 1
fi

echo "✅ Node.js版本: $(node -v)"

# 检查pnpm
if ! command -v pnpm &> /dev/null; then
    echo "⚠️  pnpm未安装，正在安装..."
    npm install -g pnpm
fi

echo "✅ pnpm版本: $(pnpm -v)"

# 检查Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker未安装，请先安装Docker"
    exit 1
fi

echo "✅ Docker已安装"

# 检查Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose未安装，请先安装Docker Compose"
    exit 1
fi

echo "✅ Docker Compose已安装"
echo ""

# 安装依赖
echo "📦 安装项目依赖..."
pnpm install

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi

echo "✅ 依赖安装完成"
echo ""

# 配置环境变量
if [ ! -f "apps/backend/.env" ]; then
    echo "📝 创建后端环境变量文件..."
    cp apps/backend/env.example apps/backend/.env
    echo "✅ 已创建 apps/backend/.env"
    echo "⚠️  请编辑此文件，配置你的BARK_KEY"
else
    echo "✅ 环境变量文件已存在"
fi

echo ""
echo "================================"
echo "✨ 安装完成！"
echo ""
echo "下一步："
echo "1. 编辑 apps/backend/.env 文件，配置BARK_KEY"
echo "2. 运行 ./scripts/start.sh 启动服务"
echo ""

