import { Module } from '@nestjs/common';
import { AlertController } from './alert.controller';
import { AlertService } from './services/alert.service';
import { BarkService } from './services/bark.service';
import { AlertManagerService } from './services/alert-manager.service';

@Module({
  controllers: [AlertController],
  providers: [AlertService, BarkService, AlertManagerService],
  exports: [AlertService, BarkService, AlertManagerService],
})
export class AlertModule {}
