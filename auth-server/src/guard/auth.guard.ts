import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RoleDocument, Roles } from 'src/schema/role.schema';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,

    @InjectModel(Roles.name)
    private readonly roles: Model<RoleDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const reqRole = this.reflector.getAllAndOverride<string[]>('role', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!reqRole) {
      return true;
    }
    const req = context.switchToHttp().getRequest();
    const token = req.cookies?.access_token;
    const payload = this.jwtService.verify(token, {
      secret: this.configService.get<string>('JWT_SECRET'),
    });

    const checkRole = await this.roles.findOne({ role: payload.role });

    if (!checkRole) {
      throw new ForbiddenException('존재하지 않는 권한입니다.');
    }

    if (payload.role === 'user') {
      req.user = payload;
    }

    if (
      payload.role === 'admin' ||
      payload.role === 'operator' ||
      payload.role === 'auditor'
    ) {
      req.admin = payload;
    }

    if (!reqRole.includes(payload.role)) {
      throw new ForbiddenException('접근할 수 없는 권한입니다.');
    }

    console.log('인증완료');
    return true;
  }
}
