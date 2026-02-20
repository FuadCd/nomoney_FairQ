import { Module } from '@nestjs/common';
import { BurdenModelingController } from './burden-modeling.controller';
import { BurdenModelingService } from './burden-modeling.service';

@Module({
  controllers: [BurdenModelingController],
  providers: [BurdenModelingService],
  exports: [BurdenModelingService],
})
export class BurdenModelingModule {}
