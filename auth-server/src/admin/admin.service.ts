import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AdminLoginDto, SignupAdminDto } from './admin.dto';
import { InjectModel } from '@nestjs/mongoose';
import { UserDocument, Users } from 'src/schema/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { RoleDocument, Roles } from 'src/schema/role.schema';

@Injectable()
export class AdminService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,

    @InjectModel(Users.name)
    private readonly users: Model<UserDocument>,

    @InjectModel(Roles.name)
    private readonly roles: Model<RoleDocument>,
  ) {}

  async signupAdmin(signupAdminDto: SignupAdminDto) {
    try {
      const password = 'qwe123123';
      const hash = await bcrypt.hash(password, 10);

      // const admin = {
      //   email: 'admin@naver.com',
      //   password: hash,
      //   name: '관리자',
      //   role: 'admin',
      //   code: '',
      // };

      // const auditor = {
      //   email: 'auditor@naver.com',
      //   password: hash,
      //   name: '에디터',
      //   role: 'auditor',
      //   code: '',
      // };

      // const operator = {
      //   email: 'operator@naver.com',
      //   password: hash,
      //   name: '오퍼레이터',
      //   role: 'operator',
      //   code: '',
      // };

      // 위 형식 처럼 관리자 회원가입
      const adminUser = new this.users(signupAdminDto);
      adminUser.save();

      return adminUser;
    } catch (e) {
      console.error(e);
    }
  }

  async loginAdmin(adminLoginDto: AdminLoginDto) {
    try {
      const admin = await this.users.findOne({ email: adminLoginDto.email });
      if (!admin) {
        throw new BadRequestException('존재하지 않는 관리자입니다.');
      }
      if (admin.role === 'user') {
        throw new BadRequestException('유저는 접근할 수 없는 경로입니다.');
      }
      await this.bcryptPassword(admin.password, adminLoginDto.password);

      const payload = {
        user_id: admin.user_id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      };

      const accessToken = await this.createAdminAccessToken(payload);
      const refreshToken = await this.createAdminRefreshToken(payload);
      return { admin, accessToken, refreshToken };
    } catch (e) {
      console.error(e);
    }
  }

  private async bcryptPassword(adminPassword: string, password: string) {
    const adminBcrypt = await bcrypt.compare(password, adminPassword);
    if (!adminBcrypt) {
      throw new BadRequestException('비밀번호가 일치하지 않습니다.');
    }
    return adminBcrypt;
  }

  private async createAdminAccessToken(payload: any) {
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '1d',
    });
    return accessToken;
  }

  private async createAdminRefreshToken(payload: any) {
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '7d',
    });
    return refreshToken;
  }
}
