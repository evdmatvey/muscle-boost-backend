import { NotFoundDomainException } from '@/common/exceptions';
import { UserProfilesErrorCode } from '../messages/user-profiles.error-codes';
import { UserProfilesMessages } from '../messages/user-profiles.messages';

export class UserProfileNotFoundException extends NotFoundDomainException {
  public constructor() {
    super(
      UserProfilesErrorCode.USER_PROFILE_NOT_FOUND,
      UserProfilesMessages[UserProfilesErrorCode.USER_PROFILE_NOT_FOUND],
    );
  }
}
