import { Injectable, Logger } from '@nestjs/common';
import { BinanceFuturesService, FuturesPosition } from './binance-futures.service';

export interface PositionAnalytics {
  symbol: string;
  longPosition: number;
  shortPosition: number;
  netPosition: number; // 净持仓
  avgLongPrice: number;
  avgShortPrice: number;
  currentPrice: number;
  netPositionValue: number; // 净持仓价值（USDT）
  unrealizedPnl: number;
  leverage: number;
}

export interface AccountAnalytics {
  totalWalletBalance: number; // 总余额
  totalUnrealizedProfit: number; // 总未实现盈亏
  totalMarginBalance: number; // 保证金余额
  totalPositionValue: number; // 总持仓价值
  availableBalance: number; // 可用余额
  marginRatio: number; // 保证金率
  liquidationDistance: number; // 距离强平的跌幅百分比
  positions: PositionAnalytics[];
}

@Injectable()
export class FuturesAnalyticsService {
  private readonly logger = new Logger(FuturesAnalyticsService.name);

  constructor(private readonly binanceFutures: BinanceFuturesService) {}

  /**
   * 获取账户分析数据
   */
  async getAccountAnalytics(): Promise<AccountAnalytics> {
    try {
      // 使用 positionRisk 接口，它包含准确的 markPrice
      const [accountInfo, positions] = await Promise.all([
        this.binanceFutures.getAccountInfo(),
        this.binanceFutures.getPositions(),
      ]);

      const totalWalletBalance = parseFloat(accountInfo.totalWalletBalance);
      const totalUnrealizedProfit = parseFloat(accountInfo.totalUnrealizedProfit);
      const availableBalance = parseFloat(accountInfo.availableBalance);

      this.logger.debug(
        `Account Info - Total Balance: ${totalWalletBalance}, Unrealized PnL: ${totalUnrealizedProfit}, Available: ${availableBalance}`,
      );
      this.logger.debug(`Positions count: ${positions?.length || 0}`);

      // 按币种分组计算净持仓（使用 positionRisk 接口的数据，它有正确的 markPrice）
      const positionsBySymbol = this.groupPositionsBySymbol(positions);

      this.logger.debug(`Grouped positions count: ${positionsBySymbol.length}`);

      // 计算总持仓价值（带符号：多头为正、空头为负）
      const totalPositionValue = positionsBySymbol.reduce(
        (sum, pos) => sum + pos.netPositionValue,
        0,
      );

      this.logger.debug(`Total Position Value: ${totalPositionValue}`);

      // 保证金余额 = 余额 + 未实现盈亏
      const totalMarginBalance = totalWalletBalance + totalUnrealizedProfit;

      // 保证金率 = 保证金余额 / 持仓价值
      const marginRatio =
        totalPositionValue > 0 ? (totalMarginBalance / totalPositionValue) * 100 : 0;

      // 距离强平的跌幅百分比（简化计算）
      // 当保证金率低于维持保证金率（约1%）时会被强平
      // 跌幅 = (当前保证金率 - 维持保证金率) / 杠杆
      const maintenanceMarginRate = 1; // 维持保证金率约1%
      const avgLeverage =
        positionsBySymbol.length > 0
          ? positionsBySymbol.reduce((sum, pos) => sum + pos.leverage, 0) / positionsBySymbol.length
          : 1;

      const liquidationDistance =
        marginRatio > maintenanceMarginRate
          ? ((marginRatio - maintenanceMarginRate) / avgLeverage) * 100
          : 0;

      const result = {
        totalWalletBalance,
        totalUnrealizedProfit,
        totalMarginBalance,
        totalPositionValue,
        availableBalance,
        marginRatio,
        liquidationDistance: Math.max(0, liquidationDistance),
        positions: positionsBySymbol,
      };

      this.logger.debug(
        `Analytics Result: ${JSON.stringify({
          totalWalletBalance: result.totalWalletBalance.toFixed(2),
          totalPositionValue: result.totalPositionValue.toFixed(2),
          positionCount: result.positions.length,
        })}`,
      );

      return result;
    } catch (error) {
      this.logger.error(`Failed to get account analytics: ${error.message}`);
      throw error;
    }
  }

  /**
   * 按币种分组并计算净持仓
   */
  private groupPositionsBySymbol(positions: FuturesPosition[]): PositionAnalytics[] {
    const grouped = new Map<string, FuturesPosition[]>();

    // 按币种分组 - 只处理有持仓的
    for (const pos of positions) {
      const amount = parseFloat(pos.positionAmt);
      if (amount === 0) {
        continue; // 跳过空仓
      }

      if (!grouped.has(pos.symbol)) {
        grouped.set(pos.symbol, []);
      }
      grouped.get(pos.symbol)!.push(pos);
    }

    this.logger.debug(`Grouped ${grouped.size} symbols with positions`);

    // 计算每个币种的净持仓
    const analytics: PositionAnalytics[] = [];

    for (const [symbol, symbolPositions] of grouped) {
      let longPosition = 0;
      let shortPosition = 0;
      let longValue = 0;
      let shortValue = 0;
      let totalUnrealizedPnl = 0;
      let currentPrice = 0;
      let leverage = 0;

      for (const pos of symbolPositions) {
        const amount = parseFloat(pos.positionAmt);
        const entryPrice = parseFloat(pos.entryPrice);
        const markPrice = parseFloat(pos.markPrice);
        const pnl = parseFloat(pos.unRealizedProfit);

        // 调试日志
        if (markPrice === 0 || isNaN(markPrice)) {
          this.logger.warn(`⚠️ ${symbol} markPrice is ${markPrice}, raw value: ${pos.markPrice}`);
        }

        currentPrice = markPrice;
        leverage = parseInt(pos.leverage);
        totalUnrealizedPnl += pnl;

        if (amount > 0) {
          // 多头
          longPosition += amount;
          longValue += amount * entryPrice;
        } else if (amount < 0) {
          // 空头
          shortPosition += Math.abs(amount);
          shortValue += Math.abs(amount) * entryPrice;
        }
      }

      const avgLongPrice = longPosition > 0 ? longValue / longPosition : 0;
      const avgShortPrice = shortPosition > 0 ? shortValue / shortPosition : 0;

      // 净持仓 = 多头 - 空头
      const netPosition = longPosition - shortPosition;

      // 净持仓价值（USDT）：多头为正、空头为负
      const netPositionValue = netPosition * currentPrice;

      this.logger.debug(
        `${symbol}: Long=${longPosition}, Short=${shortPosition}, Net=${netPosition.toFixed(4)}, Price=${currentPrice}, Value=${netPositionValue.toFixed(2)}`,
      );

      analytics.push({
        symbol,
        longPosition,
        shortPosition,
        netPosition,
        avgLongPrice,
        avgShortPrice,
        currentPrice,
        netPositionValue,
        unrealizedPnl: totalUnrealizedPnl,
        leverage,
      });
    }

    // 按净持仓价值排序
    return analytics.sort((a, b) => b.netPositionValue - a.netPositionValue);
  }

  /**
   * 获取简化的持仓摘要
   */
  async getPositionSummary() {
    try {
      const analytics = await this.getAccountAnalytics();

      const result = {
        success: true,
        totalBalance: analytics.totalWalletBalance,
        totalPnl: analytics.totalUnrealizedProfit,
        marginBalance: analytics.totalMarginBalance,
        positionValue: analytics.totalPositionValue,
        availableBalance: analytics.availableBalance,
        marginRatio: analytics.marginRatio,
        liquidationDistance: analytics.liquidationDistance,
        positionCount: analytics.positions.length,
        positions: analytics.positions.map((pos) => ({
          symbol: pos.symbol,
          netPosition: pos.netPosition,
          netValue: pos.netPositionValue,
          pnl: pos.unrealizedPnl,
          price: pos.currentPrice,
          leverage: pos.leverage,
        })),
      };

      // 记录返回的数据用于调试
      this.logger.log(
        `📊 Position Summary: ${result.positionCount} positions, ` +
          `Total Balance: $${result.totalBalance.toFixed(2)}, ` +
          `Position Value: $${result.positionValue.toFixed(2)}`,
      );

      // 记录每个持仓的价格
      result.positions.forEach((pos) => {
        this.logger.debug(
          `  ${pos.symbol}: Price=$${pos.price}, NetValue=$${pos.netValue.toFixed(2)}, PnL=$${pos.pnl.toFixed(2)}`,
        );
      });

      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to get position summary: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
