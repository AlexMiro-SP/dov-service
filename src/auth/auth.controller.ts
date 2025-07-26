import { Controller, Post, Body, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from '../user/dto/login-user.dto';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Public } from '../common/decorators/public.decorator';
import { JwtService } from '@nestjs/jwt';
import { CurrentUser } from '../common/decorators/user.decorator';
import { JwtUser } from '../common/interfaces/jwt-user';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login' })
  @ApiBody({ type: LoginUserDto })
  login(@Body() dto: LoginUserDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh Token' })
  @ApiBody({ type: RefreshTokenDto })
  async refresh(@Body() dto: RefreshTokenDto) {
    let payload: { sub: string; role: string };

    try {
      payload = this.jwtService.verify(dto.refresh_token, {
        secret: process.env.JWT_SECRET,
      });
    } catch (e: unknown) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Refresh token verification failed:', e);
      }
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.userService.findById(payload.sub);
    if (!user?.refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const isMatch = await bcrypt.compare(dto.refresh_token, user.refreshToken);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.authService.generateTokens(user.id, user.role);
    await this.authService.updateRefreshToken(user.id, tokens.refresh_token);
    return tokens;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Logout' })
  async logout(@CurrentUser() user: JwtUser) {
    await this.userService.removeRefreshToken(user.id);
    return { message: 'Logged out' };
  }
}
