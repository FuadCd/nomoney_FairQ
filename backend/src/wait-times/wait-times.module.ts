import { Module } from '@nestjs/common';
import { WaitTimesController } from './wait-times.controller';
import { WaitTimesService } from './wait-times.service';

@Module({
  controllers: [WaitTimesController],
  providers: [WaitTimesService],
  exports: [WaitTimesService],
})
export class WaitTimesModule {}
