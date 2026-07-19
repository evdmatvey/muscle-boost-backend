import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { type AuthenticatedUser, CurrentUser } from '@/modules/auth';
import { toSetLogResponse } from '../../mappers/workout-sessions.mapper';
import { CreateSetLogDto } from './dto/create-set-log.dto';
import { SetLogDataResponseDto } from './dto/set-log-data.response.dto';
import { UpdateSetLogDto } from './dto/update-set-log.dto';
import { SetLogService } from './set-log.service';

@ApiTags('workout-sessions')
@ApiBearerAuth()
@Controller('v1/workout-sessions/:sessionId/exercises/:sessionExerciseId/sets')
export class SetLogController {
  public constructor(private readonly _setLogService: SetLogService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add set log to session exercise' })
  @ApiCreatedResponse({ type: SetLogDataResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiNotFoundResponse({ description: 'Session exercise not found' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing access token' })
  public async create(
    @CurrentUser() user: AuthenticatedUser,
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @Param('sessionExerciseId', ParseUUIDPipe) sessionExerciseId: string,
    @Body() dto: CreateSetLogDto,
  ): Promise<SetLogDataResponseDto> {
    const setLog = await this._setLogService.create(
      user.userId,
      sessionId,
      sessionExerciseId,
      {
        setNumber: dto.setNumber,
        plannedReps: dto.plannedReps,
        plannedWeightKg: dto.plannedWeightKg,
        actualReps: dto.actualReps,
        actualWeightKg: dto.actualWeightKg,
        rpe: dto.rpe,
        isWarmup: dto.isWarmup,
        completedAt: dto.completedAt,
      },
    );

    return { data: toSetLogResponse(setLog) };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update set log' })
  @ApiOkResponse({ type: SetLogDataResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiNotFoundResponse({ description: 'Set log not found' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing access token' })
  public async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @Param('sessionExerciseId', ParseUUIDPipe) sessionExerciseId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSetLogDto,
  ): Promise<SetLogDataResponseDto> {
    const setLog = await this._setLogService.update(
      user.userId,
      sessionId,
      sessionExerciseId,
      id,
      {
        setNumber: dto.setNumber,
        plannedReps: dto.plannedReps,
        plannedWeightKg: dto.plannedWeightKg,
        actualReps: dto.actualReps,
        actualWeightKg: dto.actualWeightKg,
        rpe: dto.rpe,
        isWarmup: dto.isWarmup,
        completedAt: dto.completedAt,
      },
    );

    return { data: toSetLogResponse(setLog) };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove set log from session exercise' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: 'Set log not found' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing access token' })
  public async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @Param('sessionExerciseId', ParseUUIDPipe) sessionExerciseId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this._setLogService.remove(
      user.userId,
      sessionId,
      sessionExerciseId,
      id,
    );
  }
}
