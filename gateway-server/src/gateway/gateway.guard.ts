import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { AuthGuard } from '@nestjs/passport';
import { Model } from 'mongoose';
import { UserDocument, Users } from 'src/schema/user.schema';

@Injectable()
export class GatewayGuadrd extends AuthGuard('jwt') implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private reflctor: Reflector,

    @InjectModel(Users.name)
    private readonly users: Model<UserDocument>,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflctor.get<boolean>(
      'isPublic',
      context.getHandler(),
    );
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    const access_token = req.cookies?.access_token;
    const refresh_token = req.cookies?.refresh_token;

    if (!access_token || !refresh_token) {
      throw new UnauthorizedException(
        '토큰이 존재하지 않습니다. 다시 로그인해 주세요.',
      );
    }

    try {
      const payload = await this.jwtService.verifyAsync(access_token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
    } catch (e) {
      if (e.name === 'TokenExpiredError') {
        if (!refresh_token) {
          throw new UnauthorizedException(
            '토큰이 존재하지 않습니다. 다시 로그인해 주세요.',
          );
        }

        try {
          const refreshPayload = await this.jwtService.verifyAsync(
            refresh_token,
            {
              secret: this.configService.get<string>('JWT_SECRET'),
            },
          );

          const user = await this.users.findById(refreshPayload.email);

          if (!user || user?.refresh_token !== refresh_token) {
            throw new UnauthorizedException('토큰이 일치하지 않습니다.');
          }

          const newAccessToken = this.jwtService.sign(refreshPayload, {
            secret: this.configService.get<string>('JWT_SECRET'),
            expiresIn: '1d',
          });

          res.cookie('access_token', newAccessToken, {
            httpOnly: true,
            sameSite: 'strict',
            secure: false,
          });
          console.log('access_token 재발급');
        } catch (e) {
          throw new UnauthorizedException('토큰이 일치하지 않습니다.');
        }
      } else {
        throw new UnauthorizedException('토큰이 일치하지 않습니다.');
      }
    }
    const reqRole = this.reflctor.get<string>('role', context.getHandler());
    if (reqRole && !reqRole.includes(req.user.role)) {
      throw new ForbiddenException('유효하지 않은 역할입니다.');
    }

    console.log('gateway 인증 완료');
    return true;
  }
}
