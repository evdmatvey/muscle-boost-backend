import { AuthErrorCode } from './auth.error-codes';

export const AuthMessages: Record<AuthErrorCode, string> = {
  [AuthErrorCode.INVALID_CREDENTIALS]: 'Неверный email или пароль.',
  [AuthErrorCode.INVALID_REFRESH_TOKEN]: 'Недействительный refresh token.',
  [AuthErrorCode.INVALID_ACCESS_TOKEN]: 'Недействительный access token.',
  [AuthErrorCode.SESSION_NOT_FOUND]: 'Сессия не найдена.',
};
