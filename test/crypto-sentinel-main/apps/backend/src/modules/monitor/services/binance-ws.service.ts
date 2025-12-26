import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as WebSocket from 'ws';
import { HttpsProxyAgent } from 'https-proxy-agent';

interface PriceUpdate {
  symbol: string;
  price: number;
  timestamp: number;
}

type PriceCallback = (data: PriceUpdate) => void;

@Injectable()
export class BinanceWsService implements OnModuleDestroy {
  private readonly logger = new Logger(BinanceWsService.name);
  private ws: WebSocket | null = null;
  private connectedSymbols: string[] = [];
  private callback: PriceCallback | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  constructor(private readonly configService: ConfigService) {}

  subscribe(symbols: string[], callback: PriceCallback) {
    this.connectedSymbols = symbols;
    this.callback = callback;
    this.connect();
  }

  private connect() {
    const wsUrl = this.configService.get('binance.wsUrl');

    // 构建订阅流
    const streams = this.connectedSymbols.map((s) => `${s.toLowerCase()}@ticker`).join('/');

    const url = `${wsUrl}/${streams}`;

    this.logger.log(`Connecting to Binance WebSocket: ${url}`);

    try {
      // 配置代理 - 硬编码测试
      const proxyUrl = 'http://127.0.0.1:7897'; // Clash Verge 代理地址
      this.logger.log(`Using proxy for WebSocket: ${proxyUrl}`);

      // 使用 HttpsProxyAgent 支持 wss:// 通过 HTTP 代理
      const agent = new HttpsProxyAgent(proxyUrl);
      this.logger.log(`Agent created: ${typeof agent}`);

      const options = {
        agent: agent,
      };
      this.logger.log(`Options created: ${JSON.stringify({ hasAgent: !!options.agent })}`);

      this.logger.log(`Creating WebSocket...`);
      this.ws = new WebSocket(url, options);
      this.logger.log(`✅ WebSocket object created successfully!`);

      // 设置连接超时
      setTimeout(() => {
        if (this.ws && this.ws.readyState !== WebSocket.OPEN) {
          this.logger.error('Connection timeout after 10 seconds');
          this.ws.terminate();
        }
      }, 10000);

      this.ws.on('open', () => {
        this.logger.log('✅ Connected to Binance WebSocket');
        this.reconnectAttempts = 0;
      });

      this.ws.on('message', (data: Buffer) => {
        try {
          const parsed = JSON.parse(data.toString());

          // 处理单个ticker或多个ticker
          if (parsed.stream) {
            // 多流格式
            this.handleTicker(parsed.data);
          } else if (parsed.e === '24hrTicker') {
            // 单流格式
            this.handleTicker(parsed);
          }
        } catch (error) {
          this.logger.error('Error parsing WebSocket message:', error);
        }
      });

      this.ws.on('error', (error) => {
        this.logger.error('WebSocket error:', error);
      });

      this.ws.on('close', () => {
        this.logger.warn('WebSocket connection closed');
        this.attemptReconnect();
      });
    } catch (error) {
      this.logger.error('Error creating WebSocket connection:', error);
      this.attemptReconnect();
    }
  }

  private handleTicker(ticker: any) {
    if (this.callback && ticker.s && ticker.c) {
      const update: PriceUpdate = {
        symbol: ticker.s.toUpperCase(),
        price: parseFloat(ticker.c),
        timestamp: ticker.E || Date.now(),
      };

      this.callback(update);
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.logger.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

    this.logger.log(`Reconnecting in ${delay}ms... (attempt ${this.reconnectAttempts})`);

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }

  close() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.logger.log('WebSocket closed');
  }

  getConnectedSymbols(): string[] {
    return this.connectedSymbols;
  }

  onModuleDestroy() {
    this.close();
  }
}
