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
  Put,
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
import { CreateWorkoutPlanDto } from './dto/create-workout-plan.dto';
import { ListWorkoutPlansQueryDto } from './dto/list-workout-plans-query.dto';
import { PaginatedWorkoutPlansResponseDto } from './dto/paginated-workout-plans.response.dto';
import { ReplaceWorkoutPlanDto } from './dto/replace-workout-plan.dto';
import { UpdateWorkoutPlanDto } from './dto/update-workout-plan.dto';
import { WorkoutPlanDetailDataResponseDto } from './dto/workout-plan-detail-data.response.dto';
import {
  toWorkoutPlanDetailResponse,
  toWorkoutPlanListItemResponse,
} from './mappers/workout-plans.mapper';
import { WorkoutPlansService } from './workout-plans.service';

@ApiTags('workout-plans')
@ApiBearerAuth()
@Controller('v1/workout-plans')
export class WorkoutPlansController {
  public constructor(
    private readonly _workoutPlansService: WorkoutPlansService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List workout plans' })
  @ApiOkResponse({ type: PaginatedWorkoutPlansResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing access token' })
  public async list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListWorkoutPlansQueryDto,
  ): Promise<PaginatedWorkoutPlansResponseDto> {
    const { items, total } = await this._workoutPlansService.list(user.userId, {
      workoutType: query.workoutType,
      search: query.search,
      page: query.page,
      limit: query.limit,
    });

    return {
      data: items.map(toWorkoutPlanListItemResponse),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
      },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get workout plan details' })
  @ApiOkResponse({ type: WorkoutPlanDetailDataResponseDto })
  @ApiNotFoundResponse({ description: 'Workout plan not found' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing access token' })
  public async getById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<WorkoutPlanDetailDataResponseDto> {
    const plan = await this._workoutPlansService.getById(user.userId, id);

    return { data: toWorkoutPlanDetailResponse(plan) };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create workout plan with exercises and sets' })
  @ApiCreatedResponse({ type: WorkoutPlanDetailDataResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing access token' })
  public async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateWorkoutPlanDto,
  ): Promise<WorkoutPlanDetailDataResponseDto> {
    const plan = await this._workoutPlansService.create(user.userId, {
      name: dto.name,
      notes: dto.notes,
      exercises: dto.exercises,
    });

    return { data: toWorkoutPlanDetailResponse(plan) };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Replace workout plan aggregate' })
  @ApiOkResponse({ type: WorkoutPlanDetailDataResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiNotFoundResponse({ description: 'Workout plan not found' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing access token' })
  public async replace(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReplaceWorkoutPlanDto,
  ): Promise<WorkoutPlanDetailDataResponseDto> {
    const plan = await this._workoutPlansService.replace(user.userId, id, {
      name: dto.name,
      notes: dto.notes,
      exercises: dto.exercises,
    });

    return { data: toWorkoutPlanDetailResponse(plan) };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update workout plan name and notes' })
  @ApiOkResponse({ type: WorkoutPlanDetailDataResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiNotFoundResponse({ description: 'Workout plan not found' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing access token' })
  public async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWorkoutPlanDto,
  ): Promise<WorkoutPlanDetailDataResponseDto> {
    const plan = await this._workoutPlansService.update(user.userId, id, {
      name: dto.name,
      notes: dto.notes,
    });

    return { data: toWorkoutPlanDetailResponse(plan) };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete workout plan' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: 'Workout plan not found' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing access token' })
  public async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this._workoutPlansService.remove(user.userId, id);
  }
}
