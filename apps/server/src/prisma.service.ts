import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    // Use Node process hook here to avoid Prisma event type mismatch during merges/builds.
    process.on('beforeExit', async () => {
      await app.close();
    });
  }
}
