import { Controller, Get } from '@nestjs/common';
import { WaitTimesService } from './wait-times.service';

@Controller('wait-times')
export class WaitTimesController {
  constructor(private readonly waitTimesService: WaitTimesService) {}

  @Get('facilities')
  getFacilities() {
    return this.waitTimesService.getFacilities();
  }

  @Get('current')
  getCurrentWaitTimes() {
    return this.waitTimesService.getCurrentWaitTimes();
  }
}
