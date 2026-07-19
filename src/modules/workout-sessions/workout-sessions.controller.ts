import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
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
import { CreateWorkoutSessionDto } from './dto/create-workout-session.dto';
import { ListWorkoutSessionsQueryDto } from './dto/list-workout-sessions-query.dto';
import { PaginatedWorkoutSessionsResponseDto } from './dto/paginated-workout-sessions.response.dto';
import { UpdateWorkoutSessionDto } from './dto/update-workout-session.dto';
import { WorkoutSessionDetailDataResponseDto } from './dto/workout-session-detail-data.response.dto';
import {
  toWorkoutSessionDetailResponse,
  toWorkoutSessionListItemResponse,
} from './mappers/workout-sessions.mapper';
import { WorkoutSessionsService } from './workout-sessions.service';

@ApiTags('workout-sessions')
@ApiBearerAuth()
@Controller('v1/workout-sessions')
export class WorkoutSessionsController {
  public constructor(
    private readonly _workoutSessionsService: WorkoutSessionsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List workout sessions diary' })
  @ApiOkResponse({ type: PaginatedWorkoutSessionsResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing access token' })
  public async list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListWorkoutSessionsQueryDto,
  ): Promise<PaginatedWorkoutSessionsResponseDto> {
    const { items, total } = await this._workoutSessionsService.list(
      user.userId,
      {
        workoutType: query.workoutType,
        status: query.status,
        dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
        dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
        page: query.page,
        limit: query.limit,
      },
    );

    return {
      data: items.map(toWorkoutSessionListItemResponse),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
      },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get workout session details' })
  @ApiOkResponse({ type: WorkoutSessionDetailDataResponseDto })
  @ApiNotFoundResponse({ description: 'Workout session not found' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing access token' })
  public async getById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<WorkoutSessionDetailDataResponseDto> {
    const session = await this._workoutSessionsService.getById(user.userId, id);

    return { data: toWorkoutSessionDetailResponse(session) };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create workout session from plan or ad-hoc' })
  @ApiCreatedResponse({ type: WorkoutSessionDetailDataResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing access token' })
  public async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateWorkoutSessionDto,
  ): Promise<WorkoutSessionDetailDataResponseDto> {
    const session = await this._workoutSessionsService.create(user.userId, {
      planId: dto.planId,
      startedAt: dto.startedAt,
      startNow: dto.startNow,
      exercises: dto.exercises,
    });

    return { data: toWorkoutSessionDetailResponse(session) };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update workout session startedAt' })
  @ApiOkResponse({ type: WorkoutSessionDetailDataResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiNotFoundResponse({ description: 'Workout session not found' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing access token' })
  public async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWorkoutSessionDto,
  ): Promise<WorkoutSessionDetailDataResponseDto> {
    const session = await this._workoutSessionsService.update(user.userId, id, {
      startedAt: dto.startedAt,
    });

    return { data: toWorkoutSessionDetailResponse(session) };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete workout session' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: 'Workout session not found' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing access token' })
  public async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this._workoutSessionsService.remove(user.userId, id);
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'Start planned workout session' })
  @ApiOkResponse({ type: WorkoutSessionDetailDataResponseDto })
  @ApiBadRequestResponse({ description: 'Session is not mutable' })
  @ApiNotFoundResponse({ description: 'Workout session not found' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing access token' })
  public async start(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<WorkoutSessionDetailDataResponseDto> {
    const session = await this._workoutSessionsService.start(user.userId, id);

    return { data: toWorkoutSessionDetailResponse(session) };
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Complete workout session' })
  @ApiOkResponse({ type: WorkoutSessionDetailDataResponseDto })
  @ApiBadRequestResponse({ description: 'Session is not mutable' })
  @ApiNotFoundResponse({ description: 'Workout session not found' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing access token' })
  public async complete(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<WorkoutSessionDetailDataResponseDto> {
    const session = await this._workoutSessionsService.complete(
      user.userId,
      id,
    );

    return { data: toWorkoutSessionDetailResponse(session) };
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel workout session' })
  @ApiOkResponse({ type: WorkoutSessionDetailDataResponseDto })
  @ApiBadRequestResponse({ description: 'Session is not mutable' })
  @ApiNotFoundResponse({ description: 'Workout session not found' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing access token' })
  public async cancel(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<WorkoutSessionDetailDataResponseDto> {
    const session = await this._workoutSessionsService.cancel(user.userId, id);

    return { data: toWorkoutSessionDetailResponse(session) };
  }
}
