import { Controller, Get, Post, Body } from '@nestjs/common';
import { MonitorService } from './services/monitor.service';
import { FuturesMonitorService } from './services/futures-monitor.service';
import { FuturesAnalyticsService } from './services/futures-analytics.service';

@Controller('monitor')
export class MonitorController {
  constructor(
    private readonly monitorService: MonitorService,
    private readonly futuresMonitor: FuturesMonitorService,
    private readonly futuresAnalytics: FuturesAnalyticsService,
  ) {}

  @Get('status')
  getStatus() {
    return this.monitorService.getStatus();
  }

  @Get('prices')
  getPrices() {
    return this.monitorService.getCurrentPrices();
  }

  @Post('start')
  startMonitoring(@Body() body: { symbols: string[] }) {
    return this.monitorService.startMonitoring(body.symbols);
  }

  @Post('stop')
  stopMonitoring() {
    return this.monitorService.stopMonitoring();
  }

  // 合约监控接口
  @Get('futures/status')
  getFuturesStatus() {
    return this.futuresMonitor.getStatus();
  }

  @Get('futures/positions')
  getFuturesPositions() {
    return this.futuresMonitor.getCurrentPositions();
  }

  @Post('futures/start')
  startFuturesMonitoring() {
    return this.futuresMonitor.startMonitoring();
  }

  @Post('futures/stop')
  stopFuturesMonitoring() {
    return this.futuresMonitor.stopMonitoring();
  }

  @Get('futures/analytics')
  getFuturesAnalytics() {
    return this.futuresAnalytics.getPositionSummary();
  }
}
