import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, SignupUserDto } from './auth.dto';
import { Response } from 'express';
import { RolesGuard } from 'src/guard/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  async signupUser(@Body() signupUserDto: SignupUserDto, @Res() res: Response) {
    try {
      const signup = await this.authService.signupUser(signupUserDto);
      res.status(200).json({ message: '가입이 완료되었습니다.', info: signup });
    } catch (e) {
      res.status(400).json({ message: e.response.message });
      console.error(e);
    }
  }

  @Post('/login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    try {
      const user_login = await this.authService.login(loginDto);

      res.cookie('access_token', user_login?.accessToken, {
        httpOnly: true,
        sameSite: 'strict',
        secure: false,
      });
      res.cookie('refresh_token', user_login?.refreshToken, {
        httpOnly: true,
        sameSite: 'strict',
        secure: false,
      });

      res
        .status(200)
        .json({ message: '로그인이 완료되었습니다.', info: user_login });
    } catch (e) {
      res.status(400).json({ message: e.response.message });
    }
  }

  @SetMetadata('role', ['user'])
  @Post('/logout')
  @HttpCode(200)
  async logout(@Res() res: Response) {
    res.clearCookie('access_token', { httpOnly: true, sameSite: 'strict' });
    res.clearCookie('refresh_token', { httpOnly: true, sameSite: 'strict' });
    res.status(200).json({ message: '로그아웃이 완료되었습니다.' });
  }

  @SetMetadata('role', ['user'])
  @Get('/me')
  async me(@Req() req, @Res() res: Response) {
    if (!req.cookies) {
      return res.status(400).json({ message: '토큰이 존재하지 않습니다.' });
    }
    return res.status(200).json({ user: req.user });
  }
}
