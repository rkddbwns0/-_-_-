import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RoleDocument, Roles } from 'src/schema/role.schema';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private reflector: Reflector,
    @InjectModel(Roles.name)
    private readonly roles: Model<RoleDocument>,
  ) {}

  async canActivate(context: ExecutionContext) {
    const reqPermission = this.reflector.getAllAndOverride<string[]>(
      'permission',
      [context.getHandler(), context.getClass()],
    );

    if (!reqPermission) {
      return true;
    }

    const req = context.switchToHttp().getRequest();
    const access_token = req.cookies?.access_token;
    const token = await this.validateToken(access_token);
    const payload = token;
    console.log(access_token);
    const permission = await this.roles.findOne({ role: payload.role });

    if (!permission) {
      throw new ForbiddenException('권한이 없습니다.');
    }

    const hasPermission = reqPermission.some((p) =>
      permission.permission.includes(p),
    );

    if (!payload || !hasPermission) {
      throw new ForbiddenException('권한이 없습니다.');
    }

    if (!hasPermission) {
      throw new ForbiddenException('권한이 없습니다.');
    }

    if (payload.role === 'user') {
      req.user = payload;
    } else if (
      payload.role === 'admin' ||
      payload.role === 'operator' ||
      payload.role === 'auditor'
    ) {
      req.admin = payload;
    }

    console.log('권한 인증 완료');

    return true;
  }

  private async validateToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      return payload;
    } catch (e) {
      return null;
    }
  }
}
