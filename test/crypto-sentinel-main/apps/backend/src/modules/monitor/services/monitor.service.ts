import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BinanceWsService } from './binance-ws.service';
import { VolatilityDetectorService } from './volatility-detector.service';
import { AlertService } from '../../alert/services/alert.service';

@Injectable()
export class MonitorService implements OnModuleInit {
  private readonly logger = new Logger(MonitorService.name);
  private isMonitoring = false;
  private currentPrices = new Map<string, number>();

  constructor(
    private readonly configService: ConfigService,
    private readonly binanceWsService: BinanceWsService,
    private readonly volatilityDetector: VolatilityDetectorService,
    private readonly alertService: AlertService,
  ) {}

  async onModuleInit() {
    // 自动启动监控
    const defaultSymbols = ['btcusdt'];
    this.logger.log('Starting default monitoring...');
    await this.startMonitoring(defaultSymbols);
  }

  async startMonitoring(symbols: string[]) {
    if (this.isMonitoring) {
      this.logger.warn('Monitoring is already running');
      return { status: 'already_running', symbols };
    }

    this.logger.log(`Starting monitoring for: ${symbols.join(', ')}`);
    this.isMonitoring = true;

    // 订阅币安WebSocket
    this.binanceWsService.subscribe(symbols, (data) => {
      this.handlePriceUpdate(data);
    });

    return { status: 'started', symbols };
  }

  stopMonitoring() {
    if (!this.isMonitoring) {
      return { status: 'not_running' };
    }

    this.logger.log('Stopping monitoring...');
    this.isMonitoring = false;
    this.binanceWsService.close();

    return { status: 'stopped' };
  }

  getStatus() {
    return {
      isMonitoring: this.isMonitoring,
      connectedSymbols: this.binanceWsService.getConnectedSymbols(),
      pricesCount: this.currentPrices.size,
    };
  }

  getCurrentPrices() {
    return Array.from(this.currentPrices.entries()).map(([symbol, price]) => ({
      symbol,
      price,
      timestamp: new Date().toISOString(),
    }));
  }

  private async handlePriceUpdate(data: { symbol: string; price: number; timestamp: number }) {
    const { symbol, price } = data;

    // 更新当前价格
    this.currentPrices.set(symbol, price);

    // 检测价格波动
    const volatility = this.volatilityDetector.addPrice(symbol, price);

    if (volatility && Math.abs(volatility.change1m) >= 10) {
      this.logger.warn(
        `🚨 Price Alert: ${symbol} changed ${volatility.change1m.toFixed(2)}% in 1 minute`,
      );

      // 发送告警
      await this.alertService.sendPriceAlert({
        symbol,
        price,
        volatility: volatility.change1m,
        timeframe: '1m',
      });
    }
  }
}
