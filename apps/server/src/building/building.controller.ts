import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { BuildingType } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { ResponseMessage } from '../common/response-message.decorator';
import { BuildingService } from './building.service';

@Controller('buildings')
@UseGuards(JwtAuthGuard)
export class BuildingController {
  constructor(private readonly buildingService: BuildingService) {}

  @Get()
  @ResponseMessage('Get buildings success')
  list(@CurrentUser() user: JwtPayload) {
    return this.buildingService.listBuildings(user.sub);
  }

  @Get('queue')
  @ResponseMessage('Get building queue success')
  queue(@CurrentUser() user: JwtPayload) {
    return this.buildingService.listQueues(user.sub);
  }

  @Post(':type/upgrade')
  @ResponseMessage('Start building upgrade success')
  startUpgrade(@CurrentUser() user: JwtPayload, @Param('type') type: BuildingType) {
    return this.buildingService.startUpgrade(user.sub, type);
  }

  @Post('settle')
  @ResponseMessage('Settle building queue success')
  settle(@CurrentUser() user: JwtPayload) {
    return this.buildingService.settleQueuesByUserId(user.sub);
  }
}
