import { Module } from '@nestjs/common';
import { SessionExerciseModule } from './submodules/session-exercise/session-exercise.module';
import { SetLogModule } from './submodules/set-log/set-log.module';
import { WorkoutSessionsCoreModule } from './workout-sessions-core.module';

@Module({
  imports: [WorkoutSessionsCoreModule, SessionExerciseModule, SetLogModule],
  exports: [WorkoutSessionsCoreModule],
})
export class WorkoutSessionsModule {}
