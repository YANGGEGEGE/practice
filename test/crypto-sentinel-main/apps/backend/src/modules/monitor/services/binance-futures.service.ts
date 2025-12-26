import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosProxyConfig } from 'axios';
import * as crypto from 'crypto';

export interface FuturesPosition {
  symbol: string;
  positionAmt: string;
  entryPrice: string;
  markPrice: string;
  unRealizedProfit: string;
  liquidationPrice: string;
  leverage: string;
  marginType: string;
  positionSide: string;
  updateTime: number;
}

export interface FuturesAccountInfo {
  totalWalletBalance: string;
  totalUnrealizedProfit: string;
  availableBalance: string;
  totalMarginBalance: string;
  totalPositionInitialMargin: string;
  positions: FuturesPosition[];
}

@Injectable()
export class BinanceFuturesService {
  private readonly logger = new Logger(BinanceFuturesService.name);
  private readonly apiKey: string;
  private readonly secretKey: string;
  private readonly baseUrl: string;
  private readonly proxyConfig: AxiosProxyConfig | false;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get('BINANCE_API_KEY') || '';
    this.secretKey = this.configService.get('BINANCE_SECRET_KEY') || '';
    this.baseUrl = this.configService.get('BINANCE_FUTURES_API_URL') || 'https://fapi.binance.com';

    // 配置代理
    const proxy =
      process.env.https_proxy ||
      process.env.HTTPS_PROXY ||
      process.env.http_proxy ||
      process.env.HTTP_PROXY;
    if (proxy) {
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

    if (!this.apiKey || !this.secretKey) {
      this.logger.warn('Binance Futures API keys not configured');
    } else {
      this.logger.log('Binance Futures API initialized');
    }
  }

  /**
   * 生成签名
   */
  private generateSignature(queryString: string): string {
    return crypto.createHmac('sha256', this.secretKey).update(queryString).digest('hex');
  }

  /**
   * 发送签名请求
   */
  private async signedRequest(
    method: 'GET' | 'POST' | 'DELETE',
    endpoint: string,
    params: any = {},
  ): Promise<any> {
    if (!this.apiKey || !this.secretKey) {
      throw new Error('Binance API keys not configured');
    }

    const timestamp = Date.now();
    const queryString = new URLSearchParams({
      ...params,
      timestamp: timestamp.toString(),
      recvWindow: '60000', // 允许60秒的时间窗口
    }).toString();

    const signature = this.generateSignature(queryString);
    const url = `${this.baseUrl}${endpoint}?${queryString}&signature=${signature}`;

    try {
      const config: any = {
        method,
        url,
        headers: {
          'X-MBX-APIKEY': this.apiKey,
        },
        timeout: 10000,
      };

      if (this.proxyConfig) {
        config.proxy = this.proxyConfig;
      }

      const response = await axios(config);
      return response.data;
    } catch (error) {
      this.logger.error(`Binance Futures API error: ${error.response?.data?.msg || error.message}`);
      throw error;
    }
  }

  /**
   * 获取账户信息
   */
  async getAccountInfo(): Promise<FuturesAccountInfo> {
    const data = await this.signedRequest('GET', '/fapi/v2/account');

    return {
      totalWalletBalance: data.totalWalletBalance,
      totalUnrealizedProfit: data.totalUnrealizedProfit,
      availableBalance: data.availableBalance,
      totalMarginBalance: data.totalMarginBalance,
      totalPositionInitialMargin: data.totalPositionInitialMargin,
      positions: data.positions
        .filter((p: any) => parseFloat(p.positionAmt) !== 0)
        .map((p: any) => ({
          symbol: p.symbol,
          positionAmt: p.positionAmt,
          entryPrice: p.entryPrice,
          markPrice: p.markPrice,
          unRealizedProfit: p.unRealizedProfit,
          liquidationPrice: p.liquidationPrice,
          leverage: p.leverage,
          marginType: p.marginType,
          positionSide: p.positionSide,
          updateTime: p.updateTime,
        })),
    };
  }

  /**
   * 获取持仓信息
   */
  async getPositions(): Promise<FuturesPosition[]> {
    const data = await this.signedRequest('GET', '/fapi/v2/positionRisk');

    return data
      .filter((p: any) => parseFloat(p.positionAmt) !== 0)
      .map((p: any) => ({
        symbol: p.symbol,
        positionAmt: p.positionAmt,
        entryPrice: p.entryPrice,
        markPrice: p.markPrice,
        unRealizedProfit: p.unRealizedProfit,
        liquidationPrice: p.liquidationPrice,
        leverage: p.leverage,
        marginType: p.marginType,
        positionSide: p.positionSide,
        updateTime: p.updateTime,
      }));
  }

  /**
   * 获取标记价格
   */
  async getMarkPrice(symbol: string): Promise<number> {
    const config: any = {
      method: 'GET',
      url: `${this.baseUrl}/fapi/v1/premiumIndex`,
      params: { symbol: symbol.toUpperCase() },
      timeout: 5000,
    };

    if (this.proxyConfig) {
      config.proxy = this.proxyConfig;
    }

    const response = await axios(config);
    return parseFloat(response.data.markPrice);
  }

  /**
   * 测试连接
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.getPositions();
      this.logger.log('✅ Binance Futures API connection successful');
      return true;
    } catch (error) {
      this.logger.error(`❌ Binance Futures API connection failed: ${error.message}`);
      return false;
    }
  }
}
