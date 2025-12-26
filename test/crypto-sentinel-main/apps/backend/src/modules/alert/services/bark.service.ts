import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosProxyConfig } from 'axios';

interface BarkMessage {
  title: string;
  body: string;
  sound?: string;
  level?: string;
  group?: string;
  url?: string;
}

@Injectable()
export class BarkService {
  private readonly logger = new Logger(BarkService.name);
  private readonly barkKey: string;
  private readonly barkUrl: string;
  private readonly proxyConfig: AxiosProxyConfig | false;

  constructor(private readonly configService: ConfigService) {
    this.barkKey = this.configService.get('bark.key') || '';
    this.barkUrl = this.configService.get('bark.url') || 'https://api.day.app';

    // 从环境变量获取代理配置
    const proxy =
      process.env.https_proxy ||
      process.env.HTTPS_PROXY ||
      process.env.http_proxy ||
      process.env.HTTP_PROXY;
    if (proxy) {
      // 解析代理 URL (格式: http://127.0.0.1:7897)
      try {
        const proxyUrl = new URL(proxy);
        this.proxyConfig = {
          host: proxyUrl.hostname,
          port: parseInt(proxyUrl.port),
          protocol: proxyUrl.protocol.replace(':', ''),
        };
        this.logger.log(`Using proxy: ${proxy}`);
      } catch (error) {
        this.logger.warn(`Failed to parse proxy URL: ${proxy}`);
        this.proxyConfig = false;
      }
    } else {
      this.proxyConfig = false;
    }
  }

  async send(message: BarkMessage): Promise<void> {
    if (!this.barkKey) {
      this.logger.warn('Bark key not configured, skipping notification');
      return;
    }

    const { title, body, sound = 'bell', level, group, url } = message;

    try {
      const encodedTitle = encodeURIComponent(title);
      const encodedBody = encodeURIComponent(body);
      const barkApiUrl = `${this.barkUrl}/${this.barkKey}/${encodedTitle}/${encodedBody}`;

      const params = new URLSearchParams();
      if (sound) params.append('sound', sound);
      if (level) params.append('level', level);
      if (group) params.append('group', group);
      if (url) params.append('url', url);
      params.append('isArchive', '1'); // 保存到历史记录

      const fullUrl = `${barkApiUrl}?${params.toString()}`;

      const axiosConfig: any = {
        timeout: 10000,
      };

      if (this.proxyConfig) {
        axiosConfig.proxy = this.proxyConfig;
      }

      const response = await axios.get(fullUrl, axiosConfig);

      if (response.data.code === 200) {
        this.logger.log(`✅ Bark notification sent: [${level || 'normal'}] ${title}`);
      } else {
        this.logger.error('Bark API returned error:', response.data);
      }
    } catch (error) {
      this.logger.error('Failed to send Bark notification:', error.message);
      throw error;
    }
  }

  /**
   * 发送关键告警（静音下也会响铃）
   * 会连续发送多次以模拟持续响铃效果
   */
  async sendCriticalAlert(title: string, body: string, repeat: number = 3): Promise<void> {
    this.logger.warn(`🚨 发送关键告警: ${title} - ${body}`);

    for (let i = 0; i < repeat; i++) {
      await this.send({
        title: `🚨 ${title}`,
        body,
        sound: 'alarm', // 使用 alarm 声音，较长且紧急
        level: 'critical', // 关键告警级别，可突破静音
        group: 'critical-alerts',
      });

      // 间隔1秒后发送下一条（除了最后一条）
      if (i < repeat - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  /**
   * 发送时间敏感通知（高优先级但不突破静音）
   */
  async sendTimeSensitiveAlert(title: string, body: string): Promise<void> {
    this.logger.warn(`⚠️ 发送时间敏感通知: ${title} - ${body}`);

    await this.send({
      title: `⚠️ ${title}`,
      body,
      sound: 'multiwayinvitation', // 较长的提示音
      level: 'timeSensitive',
      group: 'alerts',
    });
  }

  /**
   * 发送普通通知
   */
  async sendNormalAlert(title: string, body: string): Promise<void> {
    await this.send({
      title,
      body,
      sound: 'bell',
      level: 'active',
      group: 'notifications',
    });
  }
}
