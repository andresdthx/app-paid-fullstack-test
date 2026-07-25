import { HttpStatus } from '@nestjs/common';
import { AppError, ErrorCategory } from '../../domain/value-objects';

export function mapErrorToHttp(error: AppError): { status: number; message: string } {
  switch (error.category) {
    case ErrorCategory.VALIDATION:
      return { status: HttpStatus.BAD_REQUEST, message: error.message };
    case ErrorCategory.NOT_FOUND:
      return { status: HttpStatus.NOT_FOUND, message: error.message };
    case ErrorCategory.CONFLICT:
      return { status: HttpStatus.CONFLICT, message: error.message };
    case ErrorCategory.EXTERNAL_SERVICE:
      return { status: HttpStatus.BAD_GATEWAY, message: 'Payment service temporarily unavailable' };
    case ErrorCategory.INTEGRITY:
      return { status: HttpStatus.BAD_REQUEST, message: 'Payment integrity verification failed' };
    case ErrorCategory.INSUFFICIENT_STOCK:
      return { status: HttpStatus.BAD_REQUEST, message: error.message };
    case ErrorCategory.INTERNAL:
    default:
      return { status: HttpStatus.INTERNAL_SERVER_ERROR, message: 'An unexpected error occurred' };
  }
}
