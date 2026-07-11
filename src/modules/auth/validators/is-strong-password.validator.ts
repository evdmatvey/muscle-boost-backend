import {
  type ValidationOptions,
  ValidatorConstraint,
  type ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import { AuthValidationMessages } from '../messages/auth.validation.messages';

const STRONG_PASSWORD_REGEX = /^(?=.*\d)(?=.*[a-zA-Z])(?=.*[^a-zA-Z0-9]).{8,}$/;

@ValidatorConstraint({ name: 'isStrongPassword', async: false })
export class IsStrongPasswordConstraint implements ValidatorConstraintInterface {
  public validate(value: unknown): boolean {
    return typeof value === 'string' && STRONG_PASSWORD_REGEX.test(value);
  }

  public defaultMessage(): string {
    return AuthValidationMessages.PASSWORD_TOO_WEAK;
  }
}

export const IsStrongPassword = (
  validationOptions?: ValidationOptions,
): PropertyDecorator => {
  return (object: object, propertyName: string | symbol) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName as string,
      options: validationOptions,
      constraints: [],
      validator: IsStrongPasswordConstraint,
    });
  };
};
