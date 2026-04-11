import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../prisma.service';
import { PlayerController } from './player.controller';
import { PlayerService } from './player.service';

@Module({
  imports: [AuthModule],
  controllers: [PlayerController],
  providers: [PlayerService, PrismaService]
})
export class PlayerModule {}
