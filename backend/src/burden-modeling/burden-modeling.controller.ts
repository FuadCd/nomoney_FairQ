import { Body, Controller, Post } from '@nestjs/common';
import { BurdenModelingService } from './burden-modeling.service';
import { ComputeBurdenDto } from './dto/compute-burden.dto';

@Controller('burden-modeling')
export class BurdenModelingController {
  constructor(private readonly burdenService: BurdenModelingService) {}

  @Post('compute')
  computeBurden(@Body() dto: ComputeBurdenDto) {
    return this.burdenService.computeBurden(dto);
  }
}
