import type { ValidationError } from 'class-validator';
import type { ErrorDetail } from '@/common/exceptions';

export const formatValidationErrors = (
  errors: ValidationError[],
  parentPath = '',
): ErrorDetail[] => {
  return errors.flatMap((error) => {
    const field = parentPath
      ? `${parentPath}.${error.property}`
      : error.property;

    const current = error.constraints
      ? Object.values(error.constraints).map((message) => ({ field, message }))
      : [];

    const nested = error.children?.length
      ? formatValidationErrors(error.children, field)
      : [];

    return [...current, ...nested];
  });
};
