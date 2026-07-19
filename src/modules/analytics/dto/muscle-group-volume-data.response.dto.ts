import { createDataResponseDto } from '@/common/dto';
import { MuscleGroupVolumeResponseDto } from './muscle-group-volume.response.dto';

export class MuscleGroupVolumeDataResponseDto extends createDataResponseDto(
  MuscleGroupVolumeResponseDto,
  'MuscleGroupVolumeDataResponseDto',
) {}
