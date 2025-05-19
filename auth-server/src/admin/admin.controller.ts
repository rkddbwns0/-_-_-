import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminLoginDto, SignupAdminDto } from './admin.dto';
import { Response } from 'express';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('/signup')
  async signupAdmin(
    @Body() signupAdminDto: SignupAdminDto,
    @Res() res: Response,
  ) {
    try {
      const admin = await this.adminService.signupAdmin(signupAdminDto);
      res.status(200).json({ message: '가입이 완료되었습니다.', info: admin });
    } catch (e) {
      console.error(e);
      res.status(400).json({ message: e.response.message });
    }
  }
  // admin 로그인 controller
  @Post('/login')
  async loginAdmin(@Body() adminLoginDto: AdminLoginDto, @Res() res: Response) {
    try {
      const admin = await this.adminService.loginAdmin(adminLoginDto);

      res.cookie('access_token', admin?.accessToken, {
        httpOnly: true,
        sameSite: 'strict',
        secure: false,
      });
      res.cookie('refresh_token', admin?.refreshToken, {
        httpOnly: true,
        sameSite: 'strict',
        secure: false,
      });

      res
        .status(200)
        .json({ message: '로그인이 완료되었습니다.', info: admin });
    } catch (e) {
      console.error(e);
      res.status(400).json({ message: e.response.message });
    }
  }

  // admin 본인 확인 controller
  @SetMetadata('role', ['admin', 'operator', 'auditor'])
  @Get('/me')
  async adminMe(@Req() req, @Res() res: Response) {
    if (!req.cookies) {
      return res.status(400).json({ message: '토큰이 존재하지 않습니다.' });
    }
    return res.status(200).json({ admin: req.admin });
  }

  // admin 로그아웃 controller
  @SetMetadata('role', ['admin', 'operator', 'auditor'])
  @Post('/logout')
  async adminLogout(@Res() res: Response) {
    res.clearCookie('access_token', { httpOnly: true, sameSite: 'strict' });
    res.clearCookie('refresh_token', { httpOnly: true, sameSite: 'strict' });
    res.status(200).json({ message: '로그아웃이 완료되었습니다.' });
  }
}
