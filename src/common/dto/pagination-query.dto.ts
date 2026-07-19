import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { ValidationMessages } from '../messages/validation.messages';

export class PaginationQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1, example: 1 })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    value === undefined || value === null || value === '' ? 1 : value,
  )
  @Type(() => Number)
  @IsInt({ message: ValidationMessages.PAGE_INVALID })
  @Min(1, { message: ValidationMessages.PAGE_MIN })
  public page!: number;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100, example: 20 })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    value === undefined || value === null || value === '' ? 20 : value,
  )
  @Type(() => Number)
  @IsInt({ message: ValidationMessages.LIMIT_INVALID })
  @Min(1, { message: ValidationMessages.LIMIT_MIN })
  @Max(100, { message: ValidationMessages.LIMIT_MAX })
  public limit!: number;
}
