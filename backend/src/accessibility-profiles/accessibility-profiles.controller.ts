import { Body, Controller, Get, Post } from '@nestjs/common';
import { AccessibilityProfileDto } from './dto/accessibility-profile.dto';
import { AccessibilityProfilesService } from './accessibility-profiles.service';

@Controller('accessibility-profiles')
export class AccessibilityProfilesController {
  constructor(
    private readonly profilesService: AccessibilityProfilesService,
  ) {}

  @Get('templates')
  getProfileTemplates() {
    return this.profilesService.getProfileTemplates();
  }

  @Post('compute')
  computeProfile(@Body() dto: AccessibilityProfileDto) {
    return this.profilesService.computeProfile(dto);
  }
}
