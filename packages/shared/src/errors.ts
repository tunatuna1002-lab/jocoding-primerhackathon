export interface ErrorPayload {
  code: string;
  message: string;
  details?: unknown;
}

export class AppError extends Error {
  public readonly status: number;
  constructor(message: string, public readonly code: string, status = 400, public readonly details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.status = status;
  }
}

export function toErrorPayload(error: unknown): ErrorPayload {
  if (error instanceof AppError) {
    return {
      code: error.code,
      message: error.message,
      details: error.details
    };
  }

  if (error instanceof Error) {
    return {
      code: 'INTERNAL_ERROR',
      message: error.message
    };
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: 'Unknown error'
  };
}
