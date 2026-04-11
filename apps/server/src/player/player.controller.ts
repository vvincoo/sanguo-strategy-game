import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { ResponseMessage } from '../common/response-message.decorator';
import { PlayerService } from './player.service';

@Controller('player')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Get current player success')
  getMe(@CurrentUser() user: JwtPayload) {
    return this.playerService.getCurrentPlayer(user.sub);
  }
}
