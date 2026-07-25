export interface Success<T> {
  kind: 'success';
  value: T;
}

export interface Failure<E> {
  kind: 'failure';
  error: E;
}

export type Result<T, E> = Success<T> | Failure<E>;

export function success<T>(value: T): Success<T> {
  return { kind: 'success', value };
}

export function failure<E>(error: E): Failure<E> {
  return { kind: 'failure', error };
}

export function isSuccess<T, E>(result: Result<T, E>): result is Success<T> {
  return result.kind === 'success';
}

export function isFailure<T, E>(result: Result<T, E>): result is Failure<E> {
  return result.kind === 'failure';
}
