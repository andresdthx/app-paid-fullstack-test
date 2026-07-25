import { AppError, ErrorCategory } from './app-error';

describe('AppError', () => {
  it('should create validation error', () => {
    const error = AppError.validation('Invalid input', 'details');
    expect(error.category).toBe(ErrorCategory.VALIDATION);
    expect(error.message).toBe('Invalid input');
    expect(error.details).toBe('details');
  });

  it('should create notFound error', () => {
    const error = AppError.notFound('Not found');
    expect(error.category).toBe(ErrorCategory.NOT_FOUND);
    expect(error.message).toBe('Not found');
  });

  it('should create conflict error', () => {
    const error = AppError.conflict('Duplicate');
    expect(error.category).toBe(ErrorCategory.CONFLICT);
  });

  it('should create externalService error', () => {
    const error = AppError.externalService('Timeout');
    expect(error.category).toBe(ErrorCategory.EXTERNAL_SERVICE);
  });

  it('should create integrity error', () => {
    const error = AppError.integrity('Mismatch');
    expect(error.category).toBe(ErrorCategory.INTEGRITY);
  });

  it('should create insufficientStock error with default message', () => {
    const error = AppError.insufficientStock();
    expect(error.category).toBe(ErrorCategory.INSUFFICIENT_STOCK);
    expect(error.message).toBe('Insufficient stock for requested quantity');
  });

  it('should create insufficientStock error with custom message', () => {
    const error = AppError.insufficientStock('Only 2 left');
    expect(error.message).toBe('Only 2 left');
  });

  it('should create internal error', () => {
    const error = AppError.internal('Server error', 'stack trace');
    expect(error.category).toBe(ErrorCategory.INTERNAL);
    expect(error.details).toBe('stack trace');
  });
});
