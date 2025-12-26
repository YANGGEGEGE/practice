const WebSocket = require('ws');
const { HttpsProxyAgent } = require('https-proxy-agent');

const proxyUrl = process.env.http_proxy || 'http://127.0.0.1:7897';
const wsUrl = 'wss://stream.binance.com:9443/ws/btcusdt@ticker';

console.log('Testing WebSocket connection...');
console.log('Proxy:', proxyUrl);
console.log('WebSocket URL:', wsUrl);

const agent = new HttpsProxyAgent(proxyUrl);

const ws = new WebSocket(wsUrl, {
  agent: agent
});

ws.on('open', () => {
  console.log('✅ Connected to Binance WebSocket!');
  setTimeout(() => {
    ws.close();
    console.log('Connection test successful!');
    process.exit(0);
  }, 2000);
});

ws.on('message', (data) => {
  const parsed = JSON.parse(data.toString());
  console.log('📊 Received price:', parsed.c);
});

ws.on('error', (error) => {
  console.error('❌ WebSocket error:', error.message);
  console.error('Error details:', error);
  process.exit(1);
});

ws.on('close', () => {
  console.log('Connection closed');
});

setTimeout(() => {
  console.log('❌ Connection timeout');
  process.exit(1);
}, 10000);

