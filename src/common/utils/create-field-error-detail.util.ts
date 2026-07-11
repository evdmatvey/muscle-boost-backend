import type { ErrorDetail } from '@/common/exceptions';

export const createFieldErrorDetail = (
  field: string,
  message: string,
): ErrorDetail => ({
  field,
  message,
});
