export enum ErrorCategory {
  VALIDATION = 'VALIDATION',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE',
  INTEGRITY = 'INTEGRITY',
  INSUFFICIENT_STOCK = 'INSUFFICIENT_STOCK',
  INTERNAL = 'INTERNAL',
}

export class AppError {
  readonly category: ErrorCategory;
  readonly message: string;
  readonly details?: string;

  private constructor(category: ErrorCategory, message: string, details?: string) {
    this.category = category;
    this.message = message;
    this.details = details;
  }

  static validation(message: string, details?: string): AppError {
    return new AppError(ErrorCategory.VALIDATION, message, details);
  }

  static notFound(message: string, details?: string): AppError {
    return new AppError(ErrorCategory.NOT_FOUND, message, details);
  }

  static conflict(message: string, details?: string): AppError {
    return new AppError(ErrorCategory.CONFLICT, message, details);
  }

  static externalService(message: string, details?: string): AppError {
    return new AppError(ErrorCategory.EXTERNAL_SERVICE, message, details);
  }

  static integrity(message: string, details?: string): AppError {
    return new AppError(ErrorCategory.INTEGRITY, message, details);
  }

  static insufficientStock(message?: string): AppError {
    return new AppError(
      ErrorCategory.INSUFFICIENT_STOCK,
      message ?? 'Insufficient stock for requested quantity',
    );
  }

  static internal(message: string, details?: string): AppError {
    return new AppError(ErrorCategory.INTERNAL, message, details);
  }
}
