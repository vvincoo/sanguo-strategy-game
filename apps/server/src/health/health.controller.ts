import { Controller, Get } from '@nestjs/common';
import { ResponseMessage } from '../common/response-message.decorator';

@Controller('health')
export class HealthController {
  @Get()
  @ResponseMessage('Health check success')
  check() {
    return {
      status: 'ok',
      service: 'war-server',
      timestamp: new Date().toISOString()
    };
  }
}
