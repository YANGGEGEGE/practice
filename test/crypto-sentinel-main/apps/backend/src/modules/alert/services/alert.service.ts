import { Injectable, Logger } from '@nestjs/common';
import { BarkService } from './bark.service';

interface PriceAlertData {
  symbol: string;
  price: number;
  volatility: number;
  timeframe: string;
}

@Injectable()
export class AlertService {
  private readonly logger = new Logger(AlertService.name);

  constructor(private readonly barkService: BarkService) {}

  async sendPriceAlert(data: PriceAlertData) {
    const { symbol, price, volatility, timeframe } = data;

    const title = `🚨 ${symbol} 价格异动`;
    const content = `${timeframe}内波动 ${volatility > 0 ? '+' : ''}${volatility.toFixed(2)}%\n当前价格: $${price.toLocaleString()}`;

    try {
      await this.barkService.send({
        title,
        body: content,
        sound: 'horn',
        level: 'timeSensitive',
        group: 'crypto-alert',
      });

      this.logger.log(`✅ Alert sent for ${symbol}`);
      return { success: true, symbol };
    } catch (error) {
      this.logger.error(`Failed to send alert for ${symbol}:`, error);
      return { success: false, symbol, error: error.message };
    }
  }

  async sendTestAlert(message?: string) {
    const title = '🧪 测试通知';
    const content = message || 'Crypto Sentinel 系统测试通知';

    try {
      await this.barkService.send({
        title,
        body: content,
        sound: 'bell',
        level: 'timeSensitive',
      });

      this.logger.log('✅ Test alert sent');
      return { success: true, message: 'Test alert sent successfully' };
    } catch (error) {
      this.logger.error('Failed to send test alert:', error);
      return { success: false, error: error.message };
    }
  }

  async sendCustomAlert(
    title: string,
    content: string,
    level: 'info' | 'warning' | 'critical' = 'info',
  ) {
    const soundMap = {
      info: 'glass',
      warning: 'bell',
      critical: 'alarm',
    };

    try {
      await this.barkService.send({
        title,
        body: content,
        sound: soundMap[level],
        level: level === 'critical' ? 'timeSensitive' : undefined,
      });

      this.logger.log(`✅ Custom alert sent: ${title}`);
      return { success: true };
    } catch (error) {
      this.logger.error('Failed to send custom alert:', error);
      return { success: false, error: error.message };
    }
  }
}
