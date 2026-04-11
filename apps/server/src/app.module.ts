import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { BuildingModule } from './building/building.module';
import { CityModule } from './city/city.module';
import { HealthModule } from './health/health.module';
import { PlayerModule } from './player/player.module';
import { PrismaService } from './prisma.service';
import { RedisService } from './redis.service';
import { ResourceModule } from './resource/resource.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env']
    }),
    AuthModule,
    HealthModule,
    ResourceModule,
    CityModule,
    PlayerModule,
    BuildingModule
  ],
  providers: [PrismaService, RedisService]
})
export class AppModule {}
