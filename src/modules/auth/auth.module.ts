import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JWT_ACCESS_SECRET_KEY } from '@/config/jwt.config';
import { UsersModule } from '@/modules/users';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserSession } from './entities/user-session.entity';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserSessionsRepository } from './repositories/user-sessions.repository';
import { USER_SESSIONS_REPOSITORY } from './repositories/user-sessions.repository.interface';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>(JWT_ACCESS_SECRET_KEY),
      }),
    }),
    TypeOrmModule.forFeature([UserSession]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserSessionsRepository,
    {
      provide: USER_SESSIONS_REPOSITORY,
      useExisting: UserSessionsRepository,
    },
    JwtStrategy,
    JwtAuthGuard,
    {
      provide: APP_GUARD,
      useExisting: JwtAuthGuard,
    },
  ],
  exports: [JwtAuthGuard],
})
export class AuthModule {}
