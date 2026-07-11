import { UsersErrorCode } from './users.error-codes';

export const UsersMessages: Record<UsersErrorCode, string> = {
  [UsersErrorCode.USER_NOT_FOUND]: 'Пользователь не найден.',
  [UsersErrorCode.EMAIL_ALREADY_IN_USE]: 'Email уже используется.',
};
