import {
  type ValidationOptions,
  ValidatorConstraint,
  type ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import { parseDurationToMs } from '@/common/utils/parse-duration.util';

@ValidatorConstraint({ name: 'isDuration', async: false })
export class IsDurationConstraint implements ValidatorConstraintInterface {
  public validate(value: unknown): boolean {
    if (typeof value !== 'string') {
      return false;
    }

    try {
      parseDurationToMs(value);

      return true;
    } catch {
      return false;
    }
  }

  public defaultMessage(): string {
    return 'Duration must match format <number><d|h|m|s>, e.g. 15m, 7d';
  }
}

export const IsDuration = (
  validationOptions?: ValidationOptions,
): PropertyDecorator => {
  return (object: object, propertyName: string | symbol) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName as string,
      options: validationOptions,
      constraints: [],
      validator: IsDurationConstraint,
    });
  };
};
