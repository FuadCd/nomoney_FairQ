import { Controller, Get, Param } from '@nestjs/common';
import { WaitTimesService } from './wait-times.service';

@Controller('wait-times')
export class WaitTimesController {
  constructor(private readonly waitTimesService: WaitTimesService) {}

  @Get()
  getSnapshot() {
    return this.waitTimesService.getSnapshot();
  }

  @Get('facilities')
  getFacilities() {
    return this.waitTimesService.getFacilities();
  }

  @Get('current')
  getCurrentWaitTimes() {
    return this.waitTimesService.getCurrentWaitTimes();
  }

  @Get(':hospitalKey')
  getOne(@Param('hospitalKey') hospitalKey: string) {
    const hospital = this.waitTimesService.getHospitalWaitTime(hospitalKey);
    return hospital ?? { error: 'Unknown hospitalKey' };
  }
}
