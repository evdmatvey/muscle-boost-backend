import { SessionStatus } from '@/common/enums';

export const isSessionMutable = (status: SessionStatus): boolean => {
  return (
    status === SessionStatus.PLANNED || status === SessionStatus.IN_PROGRESS
  );
};
