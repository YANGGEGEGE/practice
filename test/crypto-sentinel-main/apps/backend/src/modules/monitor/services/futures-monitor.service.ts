import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BinanceFuturesService, FuturesPosition } from './binance-futures.service';
import { AlertService } from '../../alert/services/alert.service';
import { AlertManagerService } from '../../alert/services/alert-manager.service';
import { FuturesAnalyticsService } from './futures-analytics.service';

interface PositionPriceHistory {
  symbol: string;
  prices: Array<{ price: number; timestamp: number }>;
  lastAlertTime: number;
}

@Injectable()
export class FuturesMonitorService implements OnModuleInit {
  private readonly logger = new Logger(FuturesMonitorService.name);
  private monitoringActive = false;
  private monitorInterval: NodeJS.Timeout | null = null;
  private priceHistory: Map<string, PositionPriceHistory> = new Map();
  private lastMarginCheckTime = 0;

  private readonly interval: number;
  private readonly dropThreshold: number;
  private readonly timeframe: number;
  private readonly minAlertInterval = 300000; // 5分钟最小告警间隔
  private readonly marginCheckInterval = 60000; // 1分钟检查一次保证金率

  constructor(
    private readonly configService: ConfigService,
    private readonly binanceFutures: BinanceFuturesService,
    private readonly alertService: AlertService,
    private readonly alertManager: AlertManagerService,
    private readonly futuresAnalytics: FuturesAnalyticsService,
  ) {
    this.interval = this.configService.get<number>('FUTURES_MONITOR_INTERVAL') || 10000;
    this.dropThreshold = this.configService.get<number>('FUTURES_PRICE_DROP_THRESHOLD') || 5;
    this.timeframe = this.configService.get<number>('FUTURES_TIMEFRAME') || 300000;
  }

  async onModuleInit() {
    // 模块初始化时自动开始监控
    setTimeout(() => {
      this.startMonitoring();
    }, 3000);
  }

  /**
   * 开始监控
   */
  async startMonitoring() {
    if (this.monitoringActive) {
      this.logger.warn('Futures monitoring already active');
      return { success: false, message: 'Already monitoring' };
    }

    try {
      // 测试API连接
      const connected = await this.binanceFutures.testConnection();
      if (!connected) {
        throw new Error('Failed to connect to Binance Futures API');
      }

      this.monitoringActive = true;
      this.logger.log('🚀 Starting futures positions monitoring...');

      // 立即执行一次
      await this.checkPositions();

      // 设置定时检查
      this.monitorInterval = setInterval(async () => {
        await this.checkPositions();
      }, this.interval);

      return { success: true, message: 'Futures monitoring started' };
    } catch (error) {
      this.logger.error(`Failed to start futures monitoring: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * 停止监控
   */
  stopMonitoring() {
    if (!this.monitoringActive) {
      return { success: false, message: 'Not monitoring' };
    }

    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }

    this.monitoringActive = false;
    this.priceHistory.clear();
    this.logger.log('⏹️ Futures monitoring stopped');

    return { success: true, message: 'Futures monitoring stopped' };
  }

  /**
   * 获取监控状态
   */
  getStatus() {
    return {
      active: this.monitoringActive,
      interval: this.interval,
      dropThreshold: this.dropThreshold,
      timeframe: this.timeframe / 1000 / 60, // 转换为分钟
      monitoredPositions: Array.from(this.priceHistory.keys()),
    };
  }

  /**
   * 检查持仓
   */
  private async checkPositions() {
    try {
      const positions = await this.binanceFutures.getPositions();

      if (positions.length === 0) {
        this.logger.debug('No open positions found');
        return;
      }

      this.logger.debug(`Checking ${positions.length} positions...`);

      // 检查每个持仓的价格变化
      for (const position of positions) {
        await this.checkPosition(position);
      }

      // 定期检查保证金率（每分钟一次）
      const now = Date.now();
      if (now - this.lastMarginCheckTime >= this.marginCheckInterval) {
        await this.checkMarginRatio();
        this.lastMarginCheckTime = now;

        // 清理过期的冷却记录
        this.alertManager.cleanupExpiredCooldowns();
      }
    } catch (error) {
      this.logger.error(`Error checking positions: ${error.message}`);
    }
  }

  /**
   * 检查单个持仓
   */
  private async checkPosition(position: FuturesPosition) {
    const { symbol, markPrice } = position;
    const currentPrice = parseFloat(markPrice);

    // 初始化价格历史
    if (!this.priceHistory.has(symbol)) {
      this.priceHistory.set(symbol, {
        symbol,
        prices: [],
        lastAlertTime: 0,
      });
      this.logger.log(`📊 Started tracking ${symbol} at $${currentPrice}`);
    }

    // 记录价格到 AlertManager
    this.alertManager.recordPrice(symbol, currentPrice);

    // 检查价格变化告警（根据配置的规则）
    await this.alertManager.checkPriceChangeAlerts(symbol, currentPrice);
  }

  /**
   * 检查保证金率
   */
  private async checkMarginRatio() {
    try {
      const analytics = await this.futuresAnalytics.getAccountAnalytics();
      const marginRatio = analytics.marginRatio;

      await this.alertManager.checkMarginRatioAlert(marginRatio, {
        totalBalance: analytics.totalWalletBalance,
        positionValue: analytics.totalPositionValue,
        availableBalance: analytics.availableBalance,
        marginBalance: analytics.totalMarginBalance,
      });
    } catch (error) {
      this.logger.error(`Error checking margin ratio: ${error.message}`);
    }
  }

  /**
   * 发送告警
   */
  private async sendAlert(position: FuturesPosition, priceChange: number, oldPrice: number) {
    const { symbol, markPrice, positionAmt, unRealizedProfit, leverage } = position;

    const currentPrice = parseFloat(markPrice);
    const profit = parseFloat(unRealizedProfit);
    const amount = parseFloat(positionAmt);
    const timeframeMinutes = this.timeframe / 1000 / 60;

    const direction = amount > 0 ? '做多' : '做空';
    const profitStatus = profit >= 0 ? '盈利' : '亏损';

    const title = `🚨 ${symbol} 合约告警`;
    const body = `${direction} ${Math.abs(amount)} ${symbol}
${timeframeMinutes}分钟跌幅: ${priceChange.toFixed(2)}%
当前价格: $${currentPrice.toLocaleString()}
开仓价格: $${oldPrice.toLocaleString()}
杠杆倍数: ${leverage}x
未实现盈亏: $${profit.toFixed(2)} (${profitStatus})`;

    this.logger.warn(
      `⚠️ ALERT: ${symbol} dropped ${priceChange.toFixed(2)}% in ${timeframeMinutes} minutes`,
    );

    try {
      await this.alertService.sendCustomAlert(title, body, 'critical');
    } catch (error) {
      this.logger.error(`Failed to send alert: ${error.message}`);
    }
  }

  /**
   * 获取当前持仓
   */
  async getCurrentPositions() {
    try {
      const positions = await this.binanceFutures.getPositions();
      return {
        success: true,
        count: positions.length,
        positions: positions.map((p) => ({
          symbol: p.symbol,
          side: parseFloat(p.positionAmt) > 0 ? 'LONG' : 'SHORT',
          amount: Math.abs(parseFloat(p.positionAmt)),
          entryPrice: parseFloat(p.entryPrice),
          markPrice: parseFloat(p.markPrice),
          leverage: p.leverage,
          unRealizedProfit: parseFloat(p.unRealizedProfit),
          liquidationPrice: parseFloat(p.liquidationPrice),
          marginType: p.marginType,
        })),
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
