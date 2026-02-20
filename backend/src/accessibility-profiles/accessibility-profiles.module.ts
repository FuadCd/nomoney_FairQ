import { Module } from '@nestjs/common';
import { AccessibilityProfilesController } from './accessibility-profiles.controller';
import { AccessibilityProfilesService } from './accessibility-profiles.service';

@Module({
  controllers: [AccessibilityProfilesController],
  providers: [AccessibilityProfilesService],
  exports: [AccessibilityProfilesService],
})
export class AccessibilityProfilesModule {}
