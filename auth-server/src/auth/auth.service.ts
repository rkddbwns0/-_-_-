import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Users, UserDocument } from 'src/schema/user.schema';
import { LoginDto, SignupUserDto } from './auth.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { RoleDocument, Roles } from 'src/schema/role.schema';
import {
  FriendInviteLog,
  FriendInviteLogDocument,
} from 'src/schema/friendInviteLog';
import axios from 'axios';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,

    @InjectModel(Users.name)
    private readonly users: Model<UserDocument>,

    @InjectModel(Roles.name)
    private readonly roles: Model<RoleDocument>,

    @InjectModel(FriendInviteLog.name)
    private readonly friendInviteLog: Model<FriendInviteLogDocument>,

    @InjectModel('userCounter')
    private readonly userCounter: Model<any>,
  ) {}

  // 유저 가입
  // 사용자가 초대 코드를 입력했을 경우, 초대 이벤트가 있는 경우에는 해당 이벤트 참여 현황에 count 추가(초대한 사람)
  async signupUser(signupUserDto: SignupUserDto) {
    try {
      const findUser = await this.users.findOne({ email: signupUserDto.email });
      if (findUser) {
        throw new BadRequestException('이미 가입된 유저입니다.');
      }
      const userId = await this.userIdCounter('userCounter');
      signupUserDto.user_id = userId;
      const hashPassword = await this.hashPassword(signupUserDto.password);
      signupUserDto.password = hashPassword;

      const code = await this.randomCode();
      signupUserDto.code = code;

      const user = new this.users(signupUserDto);
      const savedUser = await user.save();

      if (signupUserDto.invite_code) {
        const findCode = await this.users.findOne({
          code: signupUserDto.invite_code,
        });
        if (!findCode) {
          throw new BadRequestException('존재하지 않는 코드입니다.');
        }
        await this.inviteUser(
          findCode.user_id,
          savedUser.user_id,
          signupUserDto.invite_code,
        );
        const invite_event = await axios.post(
          `${this.configService.get<string>('EVENT_SERVER_URI')}/event/invite_event`,
          {
            invite_code: signupUserDto.invite_code,
            invited_user: savedUser.user_id,
            signup_at: new Date(),
          },
          { withCredentials: true },
        );
        console.log('추천 코드 등록이 완료되었습니다.');
      }

      return user;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  private async hashPassword(password: string) {
    const hash = await bcrypt.hash(password, 10);
    return hash;
  }

  async login(loginDto: LoginDto): Promise<any> {
    try {
      const user = await this.users.findOne({ email: loginDto.email });
      if (!user) {
        throw new BadRequestException('이메일로 가입된 유저가 없습니다.');
      }

      await this.decryptPassword(user.password, loginDto.password);

      const payload = {
        user_id: user.user_id,
        email: user.email,
        name: user.name,
        role: user.role,
      };

      const accessToken = this.jwtService.sign(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '1d',
      });

      const refreshToken = this.jwtService.sign(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '7d',
      });

      if (user.refresh_token) {
        await this.users.updateOne(
          { email: user.email },
          { $set: { refresh_token: refreshToken } },
        );
      }

      user.refresh_token = refreshToken;
      user.login_at = new Date();
      await user.save();

      await this.login_event(user?.user_id, user.login_at);

      return {
        user,
        accessToken,
        refreshToken,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  private async decryptPassword(user_password: string, password: string) {
    const dePassword = await bcrypt.compare(password, user_password);
    if (!dePassword) {
      throw new BadRequestException('비밀번호가 일치하지 않습니다.');
    }
    return true;
  }

  async randomCode() {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  // 친구 초대 내역 저장
  // 초대한 사용자의 code를 입력하여 회원가입 했을 경우 해당 정보를 db에 저장
  async inviteUser(invite_user: number, invited_user: number, code: string) {
    try {
      const inviteLog = new this.friendInviteLog({
        invite_user: invite_user,
        invited_user: invited_user,
        code: code,
      });
      await inviteLog.save();
      return true;
    } catch (e) {
      console.error(e);
      throw new BadRequestException(e.message);
    }
  }

  async userIdCounter(seqName: string) {
    try {
      const seqUpdate = await this.userCounter.findOneAndUpdate(
        { _id: seqName },
        { $inc: { seq: 1 } },
        { new: true, upsert: true },
      );
      return seqUpdate.seq;
    } catch (e) {
      console.error(e);
    }
  }

  // 로그인 로그를 전송하여 출석 이벤트가 있을 경우 count
  async login_event(user_id: number, login_at: Date) {
    try {
      const login_event = await axios.post(
        `${this.configService.get<string>('EVENT_SERVER_URI')}/event/login_event`,
        { user_id: user_id, login_at: login_at },
        { withCredentials: true },
      );
      console.log('로그인 로그를 전송하였습니다.');
    } catch (e) {
      console.error(e);
    }
  }
}
