import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { type AuthenticatedUser, CurrentUser } from '@/modules/auth';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { ExerciseDataResponseDto } from './dto/exercise-data.response.dto';
import { ListExercisesQueryDto } from './dto/list-exercises-query.dto';
import { PaginatedExercisesResponseDto } from './dto/paginated-exercises.response.dto';
import { ExercisesService } from './exercises.service';
import { toExerciseResponse } from './mappers/exercises.mapper';

@ApiTags('exercises')
@ApiBearerAuth()
@Controller('v1/exercises')
export class ExercisesController {
  public constructor(private readonly _exercisesService: ExercisesService) {}

  @Get()
  @ApiOperation({ summary: 'List exercises with filters' })
  @ApiOkResponse({ type: PaginatedExercisesResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing access token' })
  public async list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListExercisesQueryDto,
  ): Promise<PaginatedExercisesResponseDto> {
    const { items, total } = await this._exercisesService.list(user.userId, {
      muscleGroup: query.muscleGroup,
      source: query.source,
      search: query.search,
      page: query.page,
      limit: query.limit,
    });

    return {
      data: items.map(toExerciseResponse),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
      },
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create custom exercise' })
  @ApiCreatedResponse({ type: ExerciseDataResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing access token' })
  public async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateExerciseDto,
  ): Promise<ExerciseDataResponseDto> {
    const exercise = await this._exercisesService.create(user.userId, {
      name: dto.name,
      description: dto.description,
      muscleGroup: dto.muscleGroup,
    });

    return { data: toExerciseResponse(exercise) };
  }
}
