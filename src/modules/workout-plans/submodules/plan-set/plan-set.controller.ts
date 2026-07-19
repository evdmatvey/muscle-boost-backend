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
import { toPlanSetResponse } from '../../mappers/workout-plans.mapper';
import { CreatePlanSetDto } from './dto/create-plan-set.dto';
import { PlanSetDataResponseDto } from './dto/plan-set-data.response.dto';
import { UpdatePlanSetDto } from './dto/update-plan-set.dto';
import { PlanSetService } from './plan-set.service';

@ApiTags('workout-plans')
@ApiBearerAuth()
@Controller('v1/workout-plans/:planId/exercises/:planExerciseId/sets')
export class PlanSetController {
  public constructor(private readonly _planSetService: PlanSetService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add set to plan exercise' })
  @ApiCreatedResponse({ type: PlanSetDataResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiNotFoundResponse({ description: 'Plan exercise not found' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing access token' })
  public async create(
    @CurrentUser() user: AuthenticatedUser,
    @Param('planId', ParseUUIDPipe) planId: string,
    @Param('planExerciseId', ParseUUIDPipe) planExerciseId: string,
    @Body() dto: CreatePlanSetDto,
  ): Promise<PlanSetDataResponseDto> {
    const planSet = await this._planSetService.create(
      user.userId,
      planId,
      planExerciseId,
      {
        setNumber: dto.setNumber,
        targetReps: dto.targetReps,
        targetWeightKg: dto.targetWeightKg,
        targetRestSec: dto.targetRestSec,
      },
    );

    return { data: toPlanSetResponse(planSet) };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update plan set' })
  @ApiOkResponse({ type: PlanSetDataResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiNotFoundResponse({ description: 'Plan set not found' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing access token' })
  public async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('planId', ParseUUIDPipe) planId: string,
    @Param('planExerciseId', ParseUUIDPipe) planExerciseId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePlanSetDto,
  ): Promise<PlanSetDataResponseDto> {
    const planSet = await this._planSetService.update(
      user.userId,
      planId,
      planExerciseId,
      id,
      {
        setNumber: dto.setNumber,
        targetReps: dto.targetReps,
        targetWeightKg: dto.targetWeightKg,
        targetRestSec: dto.targetRestSec,
      },
    );

    return { data: toPlanSetResponse(planSet) };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove set from plan exercise' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: 'Plan set not found' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing access token' })
  public async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('planId', ParseUUIDPipe) planId: string,
    @Param('planExerciseId', ParseUUIDPipe) planExerciseId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this._planSetService.remove(user.userId, planId, planExerciseId, id);
  }
}
