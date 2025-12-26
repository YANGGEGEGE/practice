import { Module } from '@nestjs/common';
import { MonitorController } from './monitor.controller';
import { MonitorService } from './services/monitor.service';
import { BinanceWsService } from './services/binance-ws.service';
import { VolatilityDetectorService } from './services/volatility-detector.service';
import { BinanceFuturesService } from './services/binance-futures.service';
import { FuturesMonitorService } from './services/futures-monitor.service';
import { FuturesAnalyticsService } from './services/futures-analytics.service';
import { AlertModule } from '../alert/alert.module';

@Module({
  imports: [AlertModule],
  controllers: [MonitorController],
  providers: [
    MonitorService,
    BinanceWsService,
    VolatilityDetectorService,
    BinanceFuturesService,
    FuturesMonitorService,
    FuturesAnalyticsService,
  ],
  exports: [MonitorService, BinanceWsService, FuturesMonitorService],
})
export class MonitorModule {}
