/**
 * Safely extract a single string value from Express query params.
 * Express 5 types query params as string | string[].
 */
export function qs(value: unknown): string | undefined {
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
  return undefined;
}

/**
 * Safely extract a string route param.
 * Express 5 types params as string | string[].
 */
export function param(value: unknown): string {
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
  return '';
}
