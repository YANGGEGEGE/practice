#!/bin/bash

echo "🔍 测试后端API接口..."
echo ""

BACKEND_URL="http://localhost:3000"

echo "📊 1. 测试健康检查接口"
curl -s "${BACKEND_URL}/health" | jq '.'
echo ""
echo ""

echo "📊 2. 测试合约分析接口"
echo "   这个接口会返回持仓数据，包括当前价格"
curl -s "${BACKEND_URL}/monitor/futures/analytics" | jq '.'
echo ""
echo ""

echo "📊 3. 测试持仓接口"
curl -s "${BACKEND_URL}/monitor/futures/positions" | jq '.'
echo ""
echo ""

echo "✅ 测试完成！"
echo ""
echo "💡 请检查上面的输出："
echo "   - positions 数组中的 price 字段是否有值"
echo "   - 如果 price 为 0，说明后端从币安API获取价格失败"
echo "   - 请查看后端日志获取更多信息"

