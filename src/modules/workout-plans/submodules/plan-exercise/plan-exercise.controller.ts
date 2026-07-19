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
import { toPlanExerciseResponse } from '../../mappers/workout-plans.mapper';
import { CreatePlanExerciseDto } from './dto/create-plan-exercise.dto';
import { PlanExerciseDataResponseDto } from './dto/plan-exercise-data.response.dto';
import { UpdatePlanExerciseDto } from './dto/update-plan-exercise.dto';
import { PlanExerciseService } from './plan-exercise.service';

@ApiTags('workout-plans')
@ApiBearerAuth()
@Controller('v1/workout-plans/:planId/exercises')
export class PlanExerciseController {
  public constructor(
    private readonly _planExerciseService: PlanExerciseService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add exercise to workout plan' })
  @ApiCreatedResponse({ type: PlanExerciseDataResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiNotFoundResponse({ description: 'Workout plan or exercise not found' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing access token' })
  public async create(
    @CurrentUser() user: AuthenticatedUser,
    @Param('planId', ParseUUIDPipe) planId: string,
    @Body() dto: CreatePlanExerciseDto,
  ): Promise<PlanExerciseDataResponseDto> {
    const planExercise = await this._planExerciseService.create(
      user.userId,
      planId,
      {
        exerciseId: dto.exerciseId,
        orderIndex: dto.orderIndex,
        notes: dto.notes,
        sets: dto.sets,
      },
    );

    return { data: toPlanExerciseResponse(planExercise) };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update plan exercise' })
  @ApiOkResponse({ type: PlanExerciseDataResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiNotFoundResponse({ description: 'Plan exercise not found' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing access token' })
  public async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('planId', ParseUUIDPipe) planId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePlanExerciseDto,
  ): Promise<PlanExerciseDataResponseDto> {
    const planExercise = await this._planExerciseService.update(
      user.userId,
      planId,
      id,
      {
        orderIndex: dto.orderIndex,
        notes: dto.notes,
      },
    );

    return { data: toPlanExerciseResponse(planExercise) };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove exercise from workout plan' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: 'Plan exercise not found' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing access token' })
  public async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('planId', ParseUUIDPipe) planId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this._planExerciseService.remove(user.userId, planId, id);
  }
}
