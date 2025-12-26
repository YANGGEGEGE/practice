import { Controller, Post, Body } from '@nestjs/common';
import { AlertService } from './services/alert.service';
import { BarkService } from './services/bark.service';

@Controller('alert')
export class AlertController {
  constructor(
    private readonly alertService: AlertService,
    private readonly barkService: BarkService,
  ) {}

  @Post('test')
  async testAlert(@Body() body: { message?: string }) {
    return this.alertService.sendTestAlert(body.message);
  }

  @Post('test-critical')
  async testCriticalAlert(@Body() body: { message?: string }) {
    const title = '测试关键告警';
    const message = body.message || '这是一条测试关键告警，会连续响铃5次！';

    try {
      await this.barkService.sendCriticalAlert(title, message, 5);
      return {
        success: true,
        message: '关键告警已发送（连续5次，模拟5秒响铃）',
        level: 'critical',
        note: '如果你的iPhone开启了关键提醒权限，即使静音也会响铃',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
