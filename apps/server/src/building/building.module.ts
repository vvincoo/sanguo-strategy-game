import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../prisma.service';
import { BuildingController } from './building.controller';
import { BuildingService } from './building.service';

@Module({
  imports: [AuthModule],
  controllers: [BuildingController],
  providers: [BuildingService, PrismaService],
  exports: [BuildingService]
})
export class BuildingModule {}
