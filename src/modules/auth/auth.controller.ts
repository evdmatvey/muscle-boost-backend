import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { AuthTokensResponseDto } from './dto/auth-tokens.response.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';
import { SessionResponseDto } from './dto/session.response.dto';
import type { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import { toAuthTokensResponse, toSessionResponse } from './mappers/auth.mapper';

@ApiTags('auth')
@Controller('v1/auth')
export class AuthController {
  public constructor(private readonly _authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiCreatedResponse({ type: AuthTokensResponseDto })
  @ApiConflictResponse({ description: 'Email already in use' })
  public async register(
    @Body() dto: RegisterDto,
    @Headers('user-agent') userAgent?: string,
  ) {
    const tokens = await this._authService.register(
      dto.email,
      dto.password,
      userAgent ?? 'Unknown',
    );

    return { data: toAuthTokensResponse(tokens) };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login' })
  @ApiOkResponse({ type: AuthTokensResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  public async login(
    @Body() dto: LoginDto,
    @Headers('user-agent') userAgent?: string,
  ) {
    const tokens = await this._authService.login(
      dto.email,
      dto.password,
      userAgent ?? 'Unknown',
    );

    return { data: toAuthTokensResponse(tokens) };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh tokens' })
  @ApiOkResponse({ type: AuthTokensResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid refresh token' })
  public async refresh(@Body() dto: RefreshDto) {
    const tokens = await this._authService.refresh(dto.refreshToken);

    return { data: toAuthTokensResponse(tokens) };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout from current session' })
  @ApiNoContentResponse()
  public async logout(@CurrentUser() user: AuthenticatedUser): Promise<void> {
    await this._authService.logout(user);
  }

  @Get('sessions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List active sessions' })
  @ApiOkResponse({ type: SessionResponseDto, isArray: true })
  public async getSessions(@CurrentUser() user: AuthenticatedUser) {
    const sessions = await this._authService.getSessions(user);

    return {
      data: sessions.map((session) =>
        toSessionResponse(session, user.sessionId),
      ),
    };
  }

  @Delete('sessions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke a specific session' })
  @ApiNoContentResponse()
  public async revokeSession(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) sessionId: string,
  ): Promise<void> {
    await this._authService.revokeSession(user, sessionId);
  }

  @Delete('sessions')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke all sessions except current' })
  @ApiNoContentResponse()
  public async revokeOtherSessions(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this._authService.revokeOtherSessions(user);
  }
}
