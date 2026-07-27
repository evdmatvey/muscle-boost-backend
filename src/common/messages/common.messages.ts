import { CommonErrorCode } from './common.error-codes';

export const CommonMessages: Record<CommonErrorCode, string> = {
  [CommonErrorCode.REQUEST_VALIDATION]: 'Проверьте введённые данные.',
  [CommonErrorCode.INTERNAL_ERROR]: 'Внутренняя ошибка сервера.',
};
