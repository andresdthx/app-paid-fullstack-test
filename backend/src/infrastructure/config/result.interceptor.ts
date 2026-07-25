import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { isFailure, isSuccess, AppError } from '../../domain/value-objects';
import { mapErrorToHttp } from './error-mapper';

/**
 * Interceptor that automatically transforms ROP Result types into HTTP responses.
 * - Success<T> → returns T with 200
 * - Failure<AppError> → throws HttpException with mapped status
 *
 * This eliminates the repetitive if(isFailure) pattern in controllers.
 */
@Injectable()
export class ResultInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (data && typeof data === 'object' && 'kind' in data) {
          if (isFailure(data)) {
            const { status, message } = mapErrorToHttp(data.error as AppError);
            throw new HttpException(message, status);
          }
          if (isSuccess(data)) {
            return data.value;
          }
        }
        return data;
      }),
    );
  }
}
