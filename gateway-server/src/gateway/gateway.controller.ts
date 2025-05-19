import { All, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { GatewayGuadrd } from './gateway.guard';
import { Roles } from 'src/decorators/role.decorator';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Public } from 'src/decorators/public.decorator';

@Controller('gateway')
export class GatewayController {
  constructor(private readonly configService: ConfigService) {}

  // proxy
  async proxyReq(req: Request, res: Response, baseUri: string) {
    try {
      const url = `${baseUri}${req.originalUrl.replace(/^\/gateway/, '')}`;
      const headers = {
        'Content-Type': 'application/json',
        Authorization: req.headers.authorization,
        Cookie: req.headers.cookie,
      };

      const config = {
        method: req.method,
        headers,
        url,
        ...(req.method !== 'GET' && { data: req.body }),
        withCredentials: true,
      };

      const response = await axios(config);

      const cookie = response.headers['set-cookie'];
      if (cookie) {
        res.setHeader('Set-Cookie', cookie);
      }
      res.status(response.status).send(response.data);
    } catch (e) {
      const status = e.response?.status || 500;
      const message = e.response?.data?.message || '서버 오류';
      res.status(status).json({ message });
    }
  }

  // 유저 회원가입 controller
  @Public()
  @Post('/auth/signup')
  async handleAuthPublicSignup(@Req() req: Request, @Res() res: Response) {
    return this.proxyReq(
      req,
      res,
      this.configService.get<string>('AUTH_SERVER_URI')!,
    );
  }

  // 유저 로그인 contoller
  @Public()
  @Post('/auth/login')
  async handleAuthPublicLogin(@Req() req: Request, @Res() res: Response) {
    return this.proxyReq(
      req,
      res,
      this.configService.get<string>('AUTH_SERVER_URI')!,
    );
  }

  // 유저 로그아웃 controller
  @Public()
  @Post('/auth/logout')
  async handleAuthPublicLogout(@Req() req: Request, @Res() res: Response) {
    return this.proxyReq(
      req,
      res,
      this.configService.get<string>('AUTH_SERVER_URI')!,
    );
  }

  // 모든 auth 서버의 요청을 해당 라우터로 처리
  // role을 검사하여 'user'만 처리할 수 있도록 함.
  // 요청 예시 (ex. http://localhost:port/gateway/auth/me)
  @UseGuards(GatewayGuadrd)
  @Roles('user')
  @All('/auth/*path')
  async handleAuth(@Req() req: Request, @Res() res: Response) {
    console.log(req.cookies);
    return this.proxyReq(
      req,
      res,
      this.configService.get<string>('AUTH_SERVER_URI')!,
    );
  }

  // admin 로그인 contoller
  @Public()
  @Post('/admin/login')
  async handleAdminPublicLogin(@Req() req: Request, @Res() res: Response) {
    return this.proxyReq(
      req,
      res,
      this.configService.get<string>('AUTH_SERVER_URI')!,
    );
  }

  // admin 로그아웃 controller
  @Public()
  @Post('/admin/logout')
  async handleAdminPublicLogout(@Req() req: Request, @Res() res: Response) {
    return this.proxyReq(
      req,
      res,
      this.configService.get<string>('AUTH_SERVER_URI')!,
    );
  }

  // admin 관련 처리 controller
  // auth 서버와 같은 곳에서 처리하지만 라우터를 구분하여 유저와 관리자의 라우터를 분리
  // 예시 (ex. http://localhost:port/gateway/admin/me)
  @UseGuards(GatewayGuadrd)
  @Roles('admin', 'operator', 'auditor')
  @All('/admin/*path')
  async handleAdmin(@Req() req: Request, @Res() res: Response) {
    return this.proxyReq(
      req,
      res,
      this.configService.get<string>('AUTH_SERVER_URI')!,
    );
  }

  // 이벤트 처리 controller
  // 예시 (ex. http://localhost:port/gateway/event/me)
  @Roles('user', 'admin', 'operator', 'auditor')
  @All('/event/*path')
  async handleEvent(@Req() req: Request, @Res() res: Response) {
    return this.proxyReq(
      req,
      res,
      this.configService.get<string>('EVENT_SERVER_URI')!,
    );
  }
}
