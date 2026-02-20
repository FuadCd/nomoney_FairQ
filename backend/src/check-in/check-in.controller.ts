import { Body, Controller, Post } from '@nestjs/common';
import { CheckInService } from './check-in.service';
import { CheckInDto } from './dto/check-in.dto';

@Controller('check-in')
export class CheckInController {
  constructor(private readonly checkInService: CheckInService) {}

  @Post()
  submitCheckIn(@Body() dto: CheckInDto) {
    return this.checkInService.processCheckIn(dto);
  }
}
