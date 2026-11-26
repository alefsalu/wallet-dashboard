export interface ProblemFieldError {
  field: string;
  message: string;
}

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  code: string;
  errors?: ProblemFieldError[];
  [key: string]: unknown;
}

export function isProblemDetails(data: unknown): data is ProblemDetails {
  if (!data || typeof data !== 'object') {
    return false;
  }
  const candidate = data as Record<string, unknown>;
  return (
    typeof candidate.title === 'string' &&
    typeof candidate.status === 'number' &&
    typeof candidate.detail === 'string'
  );
}

export function parseProblemDetails(data: unknown): ProblemDetails {
  if (isProblemDetails(data)) {
    return {
      type: typeof data.type === 'string' ? data.type : 'about:blank',
      title: data.title,
      status: data.status,
      detail: data.detail,
      instance: typeof data.instance === 'string' ? data.instance : '',
      code: typeof data.code === 'string' ? data.code : 'UNKNOWN_ERROR',
      errors: Array.isArray(data.errors) ? data.errors : undefined,
    };
  }

  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    const message =
      (typeof obj.message === 'string' && obj.message) ||
      (typeof obj.error === 'string' && obj.error) ||
      'An unexpected error occurred.';

    return {
      type: 'about:blank',
      title: 'Error',
      status: typeof obj.status === 'number' ? obj.status : 500,
      detail: message,
      instance: '',
      code: typeof obj.code === 'string' ? obj.code : 'INTERNAL_ERROR',
      errors: Array.isArray(obj.errors) ? obj.errors : undefined,
    };
  }

  return {
    type: 'about:blank',
    title: 'Error',
    status: 500,
    detail: typeof data === 'string' ? data : 'An unexpected error occurred.',
    instance: '',
    code: 'INTERNAL_ERROR',
  };
}

export function mapProblemDetailsToFieldErrors(problem: ProblemDetails): Record<string, string> {
  const result: Record<string, string> = {};
  if (problem.errors && Array.isArray(problem.errors)) {
    for (const err of problem.errors) {
      if (err.field && err.message) {
        result[err.field] = err.message;
      }
    }
  }
  return result;
}
