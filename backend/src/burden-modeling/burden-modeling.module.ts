import { Module } from '@nestjs/common';
import { BurdenModelingController } from './burden-modeling.controller';
import { BurdenModelingService } from './burden-modeling.service';
import { WaitTimesModule } from '../wait-times/wait-times.module';

@Module({
  imports: [WaitTimesModule],
  controllers: [BurdenModelingController],
  providers: [BurdenModelingService],
  exports: [BurdenModelingService],
})
export class BurdenModelingModule {}
