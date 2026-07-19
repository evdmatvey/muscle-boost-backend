import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exercise } from './entities/exercise.entity';
import { ExercisesController } from './exercises.controller';
import { ExercisesService } from './exercises.service';
import { ExercisesRepository } from './repositories/exercises.repository';
import { EXERCISES_REPOSITORY } from './repositories/exercises.repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([Exercise])],
  controllers: [ExercisesController],
  providers: [
    ExercisesRepository,
    {
      provide: EXERCISES_REPOSITORY,
      useExisting: ExercisesRepository,
    },
    ExercisesService,
  ],
  exports: [ExercisesService],
})
export class ExercisesModule {}
