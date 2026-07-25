import { Result, isFailure } from './result';
import { AppError } from './app-error';

type AsyncStep<I, O> = (input: I) => Promise<Result<O, AppError>>;

export async function pipe<A, B>(
  initial: () => Promise<Result<A, AppError>>,
  ...steps: Array<AsyncStep<any, any>>
): Promise<Result<B, AppError>> {
  let result: Result<any, AppError> = await initial();

  for (const step of steps) {
    if (isFailure(result)) {
      return result;
    }
    result = await step(result.value);
  }

  return result;
}

export async function pipeSync<A>(
  initial: Result<A, AppError>,
  ...steps: Array<AsyncStep<any, any>>
): Promise<Result<any, AppError>> {
  let result: Result<any, AppError> = initial;

  for (const step of steps) {
    if (isFailure(result)) {
      return result;
    }
    result = await step(result.value);
  }

  return result;
}
