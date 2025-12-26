import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface PriceHistory {
  prices: number[];
  timestamps: number[];
}

interface VolatilityResult {
  change1m: number;
  change5m: number;
  change15m: number;
}

@Injectable()
export class VolatilityDetectorService {
  private readonly logger = new Logger(VolatilityDetectorService.name);
  private priceHistory = new Map<string, PriceHistory>();
  private readonly maxHistorySize: number;

  constructor(private readonly configService: ConfigService) {
    this.maxHistorySize = this.configService.get('monitor.priceHistorySize') || 900;
  }

  addPrice(symbol: string, price: number): VolatilityResult | null {
    if (!this.priceHistory.has(symbol)) {
      this.priceHistory.set(symbol, {
        prices: [],
        timestamps: [],
      });
    }

    const history = this.priceHistory.get(symbol)!;
    const now = Date.now();

    // 添加新价格
    history.prices.push(price);
    history.timestamps.push(now);

    // 保持历史记录在限制内（15分钟 = 900秒，假设每秒一个数据点）
    if (history.prices.length > this.maxHistorySize) {
      history.prices.shift();
      history.timestamps.shift();
    }

    // 需要至少有60个数据点才能计算1分钟波动
    if (history.prices.length < 60) {
      return null;
    }

    return this.calculateVolatility(history);
  }

  private calculateVolatility(history: PriceHistory): VolatilityResult {
    const now = Date.now();

    // 计算1分钟前的价格
    const oneMinuteAgo = now - 60 * 1000;
    const fiveMinutesAgo = now - 5 * 60 * 1000;
    const fifteenMinutesAgo = now - 15 * 60 * 1000;

    const price1mAgo = this.getPriceAtTime(history, oneMinuteAgo);
    const price5mAgo = this.getPriceAtTime(history, fiveMinutesAgo);
    const price15mAgo = this.getPriceAtTime(history, fifteenMinutesAgo);

    const currentPrice = history.prices[history.prices.length - 1];

    return {
      change1m: this.calculatePercentageChange(price1mAgo, currentPrice),
      change5m: this.calculatePercentageChange(price5mAgo, currentPrice),
      change15m: this.calculatePercentageChange(price15mAgo, currentPrice),
    };
  }

  private getPriceAtTime(history: PriceHistory, targetTime: number): number {
    const { prices, timestamps } = history;

    // 找到最接近目标时间的价格
    let closestIndex = 0;
    let minDiff = Math.abs(timestamps[0] - targetTime);

    for (let i = 1; i < timestamps.length; i++) {
      const diff = Math.abs(timestamps[i] - targetTime);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = i;
      }
    }

    return prices[closestIndex];
  }

  private calculatePercentageChange(oldPrice: number, newPrice: number): number {
    if (oldPrice === 0) return 0;
    return ((newPrice - oldPrice) / oldPrice) * 100;
  }

  clearHistory(symbol?: string) {
    if (symbol) {
      this.priceHistory.delete(symbol);
    } else {
      this.priceHistory.clear();
    }
  }
}
