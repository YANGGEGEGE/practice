const crypto = require('crypto');
const https = require('https');

// 从环境变量或直接设置你的API密钥
const API_KEY = process.env.BINANCE_API_KEY || '';
const SECRET_KEY = process.env.BINANCE_SECRET_KEY || '';

if (!API_KEY || !SECRET_KEY) {
  console.error('❌ 请设置 BINANCE_API_KEY 和 BINANCE_SECRET_KEY 环境变量');
  process.exit(1);
}

function generateSignature(queryString) {
  return crypto.createHmac('sha256', SECRET_KEY).update(queryString).digest('hex');
}

function makeRequest(endpoint, params = {}) {
  return new Promise((resolve, reject) => {
    const timestamp = Date.now();
    const queryParams = new URLSearchParams({
      ...params,
      timestamp: timestamp.toString(),
      recvWindow: '60000',
    }).toString();

    const signature = generateSignature(queryParams);
    const url = `${endpoint}?${queryParams}&signature=${signature}`;

    const options = {
      hostname: 'fapi.binance.com',
      path: url,
      method: 'GET',
      headers: {
        'X-MBX-APIKEY': API_KEY,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          reject(new Error(`Failed to parse JSON: ${data}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.end();
  });
}

async function testFuturesAPI() {
  console.log('🔍 测试币安合约API...\n');

  try {
    // 测试账户信息接口
    console.log('📊 1. 测试账户信息接口 /fapi/v2/account');
    const accountData = await makeRequest('/fapi/v2/account');
    
    console.log('\n✅ 账户信息返回成功:');
    console.log('   总余额:', accountData.totalWalletBalance);
    console.log('   未实现盈亏:', accountData.totalUnrealizedProfit);
    console.log('   可用余额:', accountData.availableBalance);
    console.log('   保证金余额:', accountData.totalMarginBalance);
    console.log('   持仓保证金:', accountData.totalPositionInitialMargin);
    
    const positions = accountData.positions?.filter(p => parseFloat(p.positionAmt) !== 0) || [];
    console.log('\n   持仓数量:', positions.length);
    
    if (positions.length > 0) {
      console.log('\n📋 持仓详情:');
      positions.forEach((pos, index) => {
        console.log(`\n   持仓 ${index + 1}:`);
        console.log('     币种:', pos.symbol);
        console.log('     持仓量:', pos.positionAmt);
        console.log('     入场价:', pos.entryPrice);
        console.log('     标记价格:', pos.markPrice, '⚠️ 这个字段可能为空或0');
        console.log('     未实现盈亏:', pos.unRealizedProfit);
        console.log('     杠杆:', pos.leverage);
        console.log('     持仓方向:', pos.positionSide);
      });
    } else {
      console.log('\n   ℹ️ 当前没有持仓');
    }

    // 测试持仓风险接口
    console.log('\n\n📊 2. 测试持仓风险接口 /fapi/v2/positionRisk');
    const positionRisk = await makeRequest('/fapi/v2/positionRisk');
    
    const activePositions = positionRisk.filter(p => parseFloat(p.positionAmt) !== 0);
    console.log('\n✅ 持仓风险返回成功:');
    console.log('   活跃持仓数量:', activePositions.length);
    
    if (activePositions.length > 0) {
      console.log('\n📋 持仓风险详情:');
      activePositions.forEach((pos, index) => {
        console.log(`\n   持仓 ${index + 1}:`);
        console.log('     币种:', pos.symbol);
        console.log('     持仓量:', pos.positionAmt);
        console.log('     入场价:', pos.entryPrice);
        console.log('     标记价格:', pos.markPrice, '✅ 这个接口应该有正确的价格');
        console.log('     未实现盈亏:', pos.unRealizedProfit);
        console.log('     杠杆:', pos.leverage);
        console.log('     强平价格:', pos.liquidationPrice);
      });
    }

    // 如果有持仓，测试获取单个币种的标记价格
    if (activePositions.length > 0) {
      const symbol = activePositions[0].symbol;
      console.log(`\n\n📊 3. 测试标记价格接口 /fapi/v1/premiumIndex?symbol=${symbol}`);
      
      const premiumData = await new Promise((resolve, reject) => {
        const options = {
          hostname: 'fapi.binance.com',
          path: `/fapi/v1/premiumIndex?symbol=${symbol}`,
          method: 'GET',
        };

        const req = https.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => { data += chunk; });
          res.on('end', () => {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              reject(e);
            }
          });
        });

        req.on('error', reject);
        req.end();
      });

      console.log('\n✅ 标记价格返回成功:');
      console.log('   币种:', premiumData.symbol);
      console.log('   标记价格:', premiumData.markPrice, '✅ 这是实时的标记价格');
      console.log('   指数价格:', premiumData.indexPrice);
      console.log('   资金费率:', premiumData.lastFundingRate);
    }

    console.log('\n\n✅ API测试完成！');
    console.log('\n💡 建议: 使用 /fapi/v2/positionRisk 接口获取持仓，因为它包含正确的 markPrice');

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    if (error.response) {
      console.error('   响应数据:', error.response);
    }
  }
}

testFuturesAPI();

