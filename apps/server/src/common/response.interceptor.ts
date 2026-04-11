import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

interface ApiResponse<T> {
  success: true;
  message: string;
  timestamp: string;
  data: T;
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const message = Reflect.getMetadata('response_message', context.getHandler()) ?? 'OK';

    return next.handle().pipe(
      map((data) => ({
        success: true,
        message,
        timestamp: new Date().toISOString(),
        data
      }))
    );
  }
}
