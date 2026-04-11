import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { BuildingModule } from '../building/building.module';
import { PrismaService } from '../prisma.service';
import { ResourceModule } from '../resource/resource.module';
import { CityController } from './city.controller';
import { CityService } from './city.service';

@Module({
  imports: [AuthModule, ResourceModule, BuildingModule],
  controllers: [CityController],
  providers: [CityService, PrismaService]
})
export class CityModule {}
