import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { type AuthenticatedUser, CurrentUser } from '@/modules/auth';
import { AnalyticsService } from './analytics.service';
import { AnalyticsPeriodQueryDto } from './dto/analytics-period-query.dto';
import { ExerciseProgressDataResponseDto } from './dto/exercise-progress-data.response.dto';
import { ExerciseProgressQueryDto } from './dto/exercise-progress-query.dto';
import { MuscleGroupVolumeDataResponseDto } from './dto/muscle-group-volume-data.response.dto';
import { SummaryDataResponseDto } from './dto/summary-data.response.dto';

@ApiTags('analytics')
@ApiBearerAuth()
@Controller('v1/analytics')
export class AnalyticsController {
  public constructor(private readonly _analyticsService: AnalyticsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get workout analytics summary for a period' })
  @ApiOkResponse({ type: SummaryDataResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing access token' })
  public async getSummary(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: AnalyticsPeriodQueryDto,
  ): Promise<SummaryDataResponseDto> {
    const data = await this._analyticsService.getSummary(
      user.userId,
      query.period,
    );

    return { data };
  }

  @Get('exercise-progress')
  @ApiOperation({
    summary: 'Get exercise progress time series for charts',
  })
  @ApiOkResponse({ type: ExerciseProgressDataResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing access token' })
  @ApiNotFoundResponse({ description: 'Exercise not found or inaccessible' })
  public async getExerciseProgress(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ExerciseProgressQueryDto,
  ): Promise<ExerciseProgressDataResponseDto> {
    const data = await this._analyticsService.getExerciseProgress(
      user.userId,
      query.period,
      query.exerciseId,
    );

    return { data };
  }

  @Get('muscle-group-volume')
  @ApiOperation({
    summary: 'Get muscle group volume time series for charts',
  })
  @ApiOkResponse({ type: MuscleGroupVolumeDataResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing access token' })
  public async getMuscleGroupVolume(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: AnalyticsPeriodQueryDto,
  ): Promise<MuscleGroupVolumeDataResponseDto> {
    const data = await this._analyticsService.getMuscleGroupVolume(
      user.userId,
      query.period,
    );

    return { data };
  }
}
