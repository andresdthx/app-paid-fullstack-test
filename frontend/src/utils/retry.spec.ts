import { withRetry } from './retry';

describe('withRetry', () => {
  it('should return result on first successful attempt', async () => {
    const fn = jest.fn().mockResolvedValue('success');
    const result = await withRetry(fn, { maxAttempts: 3, baseDelayMs: 10 });
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure and succeed on second attempt', async () => {
    const fn = jest.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce('ok');

    const result = await withRetry(fn, { maxAttempts: 3, baseDelayMs: 10, maxDelayMs: 50, backoffMultiplier: 2 });

    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should throw after exhausting all attempts', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('persistent failure'));

    await expect(
      withRetry(fn, { maxAttempts: 3, baseDelayMs: 10, maxDelayMs: 50, backoffMultiplier: 2 }),
    ).rejects.toThrow('persistent failure');

    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should throw last error when all retries fail', async () => {
    const fn = jest.fn()
      .mockRejectedValueOnce(new Error('error 1'))
      .mockRejectedValueOnce(new Error('error 2'));

    await expect(
      withRetry(fn, { maxAttempts: 2, baseDelayMs: 10, maxDelayMs: 50, backoffMultiplier: 2 }),
    ).rejects.toThrow('error 2');
  });

  it('should work with single attempt (no retry)', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('oops'));

    await expect(
      withRetry(fn, { maxAttempts: 1, baseDelayMs: 10 }),
    ).rejects.toThrow('oops');

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should handle non-Error rejections', async () => {
    const fn = jest.fn().mockRejectedValue('string error');

    await expect(
      withRetry(fn, { maxAttempts: 1, baseDelayMs: 10 }),
    ).rejects.toThrow('string error');
  });
});
