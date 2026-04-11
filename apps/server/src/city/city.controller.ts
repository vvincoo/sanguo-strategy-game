import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { ResponseMessage } from '../common/response-message.decorator';
import { CityService } from './city.service';

@Controller('city')
@UseGuards(JwtAuthGuard)
export class CityController {
  constructor(private readonly cityService: CityService) {}

  @Get('me')
  @ResponseMessage('Get city success')
  getMyCity(@CurrentUser() user: JwtPayload) {
    return this.cityService.getMyCity(user.sub);
  }

  @Get('resources')
  @ResponseMessage('Get resource success')
  getMyResources(@CurrentUser() user: JwtPayload) {
    return this.cityService.getMyResources(user.sub);
  }
}
