const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export interface ApiEnvelope<T> {
  success: boolean;
  message: string | string[];
  timestamp: string;
  data?: T;
}

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

function resolveMessage(message: string | string[]): string {
  return Array.isArray(message) ? message.join(', ') : message;
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  token?: string
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(init.headers ?? {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers
  });

  const json = (await response.json()) as ApiEnvelope<T>;

  if (!response.ok || !json.success || !json.data) {
    throw new ApiError(response.status, resolveMessage(json.message ?? 'Request failed'));
  }

  return json.data;
}
