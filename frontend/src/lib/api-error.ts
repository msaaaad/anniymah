export class ApiError extends Error {
  readonly status: number;
  readonly messages: string[];

  constructor(status: number, messages: string[]) {
    super(messages.join(", "));
    this.name = "ApiError";
    this.status = status;
    this.messages = messages;
  }
}

export function parseErrorBody(status: number, body: unknown): ApiError {
  const raw = (body as { message?: string | string[] } | null)?.message;
  const messages = Array.isArray(raw) ? raw : raw ? [raw] : [`Request failed (${status})`];
  return new ApiError(status, messages);
}

export function errorMessages(err: unknown, fallback = "Something went wrong"): string[] {
  if (err instanceof ApiError) return err.messages;
  if (err instanceof Error && err.message) return [err.message];
  return [fallback];
}
