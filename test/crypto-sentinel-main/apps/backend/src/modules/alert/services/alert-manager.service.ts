import { Injectable, Logger } from '@nestjs/common';
import { BarkService } from './bark.service';
import {
  AlertRuleConfig,
  PriceChangeRule,
  MarginRatioRule,
  getEnabledRules,
  isInQuietHours,
} from '../../../config/alert-rules.config';

interface PriceHistory {
  symbol: string;
  price: number;
  timestamp: number;
}

interface AlertCooldown {
  ruleId: string;
  symbol?: string; // 某些规则特定于币种
  lastTriggered: number;
}

@Injectable()
export class AlertManagerService {
  private readonly logger = new Logger(AlertManagerService.name);
  private priceHistory: Map<string, PriceHistory[]> = new Map();
  private alertCooldowns: Map<string, AlertCooldown> = new Map();

  constructor(private readonly barkService: BarkService) {}

  /**
   * 记录价格历史
   */
  recordPrice(symbol: string, price: number): void {
    if (!this.priceHistory.has(symbol)) {
      this.priceHistory.set(symbol, []);
    }

    const history = this.priceHistory.get(symbol)!;
    const now = Date.now();

    history.push({ symbol, price, timestamp: now });

    // 只保留最近10分钟的数据
    const tenMinutesAgo = now - 10 * 60 * 1000;
    this.priceHistory.set(
      symbol,
      history.filter((h) => h.timestamp > tenMinutesAgo),
    );
  }

  /**
   * 检查价格变化告警
   */
  async checkPriceChangeAlerts(symbol: string, currentPrice: number): Promise<void> {
    const rules = getEnabledRules().filter((r) => r.type === 'priceChange') as PriceChangeRule[];

    for (const rule of rules) {
      // 检查是否在静默时段
      if (isInQuietHours(rule)) {
        continue;
      }

      // 检查冷却时间
      if (this.isInCooldown(rule.id, symbol)) {
        continue;
      }

      const history = this.priceHistory.get(symbol);
      if (!history || history.length < 2) {
        continue;
      }

      // 获取指定时间窗口前的价格
      const windowStart = Date.now() - rule.timeWindow * 60 * 1000;
      const oldPrices = history.filter((h) => h.timestamp <= windowStart);

      if (oldPrices.length === 0) {
        continue;
      }

      // 使用最旧的价格计算变化率
      const oldPrice = oldPrices[0].price;
      const changePercent = ((currentPrice - oldPrice) / oldPrice) * 100;
      const absChange = Math.abs(changePercent);

      if (absChange >= rule.threshold) {
        const direction = changePercent > 0 ? '上涨' : '下跌';
        const emoji = changePercent > 0 ? '📈' : '📉';

        await this.triggerAlert(rule, {
          symbol,
          currentPrice,
          oldPrice,
          changePercent,
          direction,
          emoji,
        });

        // 设置冷却时间
        this.setCooldown(rule.id, symbol, rule.cooldown);
      }
    }
  }

  /**
   * 检查保证金率告警
   */
  async checkMarginRatioAlert(marginRatio: number, details: any): Promise<void> {
    const rules = getEnabledRules().filter((r) => r.type === 'marginRatio') as MarginRatioRule[];

    for (const rule of rules) {
      // 检查是否在静默时段
      if (isInQuietHours(rule)) {
        continue;
      }

      // 检查冷却时间
      if (this.isInCooldown(rule.id)) {
        continue;
      }

      let shouldAlert = false;
      switch (rule.operator) {
        case 'lt':
          shouldAlert = marginRatio < rule.threshold;
          break;
        case 'lte':
          shouldAlert = marginRatio <= rule.threshold;
          break;
        case 'gt':
          shouldAlert = marginRatio > rule.threshold;
          break;
        case 'gte':
          shouldAlert = marginRatio >= rule.threshold;
          break;
      }

      if (shouldAlert) {
        await this.triggerAlert(rule, {
          marginRatio,
          ...details,
        });

        // 设置冷却时间
        this.setCooldown(rule.id, undefined, rule.cooldown);
      }
    }
  }

  /**
   * 触发告警
   */
  private async triggerAlert(rule: AlertRuleConfig, data: any): Promise<void> {
    let title = '';
    let body = '';

    switch (rule.type) {
      case 'priceChange':
        title = `${data.symbol} ${data.direction} ${Math.abs(data.changePercent).toFixed(2)}%`;
        body =
          `${data.emoji} 当前价格: $${data.currentPrice.toFixed(4)}\n` +
          `${rule.timeWindow}分钟前: $${data.oldPrice.toFixed(4)}\n` +
          `变化: ${data.changePercent > 0 ? '+' : ''}${data.changePercent.toFixed(2)}%`;
        break;

      case 'marginRatio':
        title = `保证金率过低: ${data.marginRatio.toFixed(2)}%`;
        body =
          `⚠️ 当前保证金率: ${data.marginRatio.toFixed(2)}%\n` +
          `总余额: $${data.totalBalance?.toFixed(2) || '0.00'}\n` +
          `持仓价值: $${data.positionValue?.toFixed(2) || '0.00'}\n` +
          `请注意风险控制！`;
        break;

      default:
        title = rule.name;
        body = JSON.stringify(data);
    }

    // 根据规则级别发送不同类型的通知
    switch (rule.level) {
      case 'critical':
        await this.barkService.sendCriticalAlert(title, body, 5); // 发送5次，模拟5秒响铃
        break;

      case 'timeSensitive':
        await this.barkService.sendTimeSensitiveAlert(title, body);
        break;

      default:
        await this.barkService.sendNormalAlert(title, body);
        break;
    }

    this.logger.warn(`🔔 告警触发: [${rule.level}] ${title}`);
  }

  /**
   * 检查是否在冷却时间内
   */
  private isInCooldown(ruleId: string, symbol?: string): boolean {
    const key = symbol ? `${ruleId}:${symbol}` : ruleId;
    const cooldown = this.alertCooldowns.get(key);

    if (!cooldown) {
      return false;
    }

    const now = Date.now();
    const cooldownEnd = cooldown.lastTriggered;

    return now < cooldownEnd;
  }

  /**
   * 设置冷却时间
   */
  private setCooldown(ruleId: string, symbol: string | undefined, minutes: number): void {
    const key = symbol ? `${ruleId}:${symbol}` : ruleId;
    const cooldownEnd = Date.now() + minutes * 60 * 1000;

    this.alertCooldowns.set(key, {
      ruleId,
      symbol,
      lastTriggered: cooldownEnd,
    });

    this.logger.debug(`设置冷却: ${key}, 到期时间: ${new Date(cooldownEnd).toLocaleString()}`);
  }

  /**
   * 清理过期的冷却记录
   */
  cleanupExpiredCooldowns(): void {
    const now = Date.now();
    for (const [key, cooldown] of this.alertCooldowns.entries()) {
      if (now >= cooldown.lastTriggered) {
        this.alertCooldowns.delete(key);
      }
    }
  }
}
