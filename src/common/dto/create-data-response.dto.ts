import { type Type } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export const createDataResponseDto = <TModel extends Type>(
  model: TModel,
  dtoName: string,
): Type<{ data: InstanceType<TModel> }> => {
  class DataResponseDtoHost {
    @ApiProperty({ type: model })
    public data!: InstanceType<TModel>;
  }

  Object.defineProperty(DataResponseDtoHost, 'name', { value: dtoName });

  return DataResponseDtoHost;
};

export const createDataArrayResponseDto = <TModel extends Type>(
  model: TModel,
  dtoName: string,
): Type<{ data: InstanceType<TModel>[] }> => {
  class DataArrayResponseDtoHost {
    @ApiProperty({ type: [model] })
    public data!: InstanceType<TModel>[];
  }

  Object.defineProperty(DataArrayResponseDtoHost, 'name', { value: dtoName });

  return DataArrayResponseDtoHost;
};
