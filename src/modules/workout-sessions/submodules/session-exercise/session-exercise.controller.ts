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
import { toSessionExerciseResponse } from '../../mappers/workout-sessions.mapper';
import { CreateSessionExerciseDto } from './dto/create-session-exercise.dto';
import { SessionExerciseDataResponseDto } from './dto/session-exercise-data.response.dto';
import { UpdateSessionExerciseDto } from './dto/update-session-exercise.dto';
import { SessionExerciseService } from './session-exercise.service';

@ApiTags('workout-sessions')
@ApiBearerAuth()
@Controller('v1/workout-sessions/:sessionId/exercises')
export class SessionExerciseController {
  public constructor(
    private readonly _sessionExerciseService: SessionExerciseService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add exercise to workout session' })
  @ApiCreatedResponse({ type: SessionExerciseDataResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiNotFoundResponse({ description: 'Workout session or exercise not found' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing access token' })
  public async create(
    @CurrentUser() user: AuthenticatedUser,
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @Body() dto: CreateSessionExerciseDto,
  ): Promise<SessionExerciseDataResponseDto> {
    const sessionExercise = await this._sessionExerciseService.create(
      user.userId,
      sessionId,
      {
        exerciseId: dto.exerciseId,
        orderIndex: dto.orderIndex,
        isSkipped: dto.isSkipped,
        sets: dto.sets,
      },
    );

    return { data: toSessionExerciseResponse(sessionExercise) };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update session exercise' })
  @ApiOkResponse({ type: SessionExerciseDataResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiNotFoundResponse({ description: 'Session exercise not found' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing access token' })
  public async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSessionExerciseDto,
  ): Promise<SessionExerciseDataResponseDto> {
    const sessionExercise = await this._sessionExerciseService.update(
      user.userId,
      sessionId,
      id,
      {
        orderIndex: dto.orderIndex,
        isSkipped: dto.isSkipped,
      },
    );

    return { data: toSessionExerciseResponse(sessionExercise) };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove exercise from workout session' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: 'Session exercise not found' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing access token' })
  public async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this._sessionExerciseService.remove(user.userId, sessionId, id);
  }
}
