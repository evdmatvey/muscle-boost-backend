import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkoutSessionsCoreModule } from '../../workout-sessions-core.module';
import { SessionExerciseModule } from '../session-exercise/session-exercise.module';
import { SetLog } from './entities/set-log.entity';
import { SetLogsRepository } from './repositories/set-logs.repository';
import { SET_LOGS_REPOSITORY } from './repositories/set-logs.repository.interface';
import { SetLogController } from './set-log.controller';
import { SetLogService } from './set-log.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SetLog]),
    SessionExerciseModule,
    WorkoutSessionsCoreModule,
  ],
  controllers: [SetLogController],
  providers: [
    SetLogsRepository,
    {
      provide: SET_LOGS_REPOSITORY,
      useExisting: SetLogsRepository,
    },
    SetLogService,
  ],
  exports: [SetLogService],
})
export class SetLogModule {}
