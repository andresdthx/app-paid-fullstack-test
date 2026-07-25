import { success, failure, isSuccess, isFailure } from './result';

describe('Result', () => {
  describe('success', () => {
    it('should create a Success with kind success', () => {
      const result = success(42);
      expect(result.kind).toBe('success');
      expect(result.value).toBe(42);
    });

    it('should pass isSuccess check', () => {
      const result = success('hello');
      expect(isSuccess(result)).toBe(true);
      expect(isFailure(result)).toBe(false);
    });
  });

  describe('failure', () => {
    it('should create a Failure with kind failure', () => {
      const result = failure('error message');
      expect(result.kind).toBe('failure');
      expect(result.error).toBe('error message');
    });

    it('should pass isFailure check', () => {
      const result = failure('oops');
      expect(isFailure(result)).toBe(true);
      expect(isSuccess(result)).toBe(false);
    });
  });
});
