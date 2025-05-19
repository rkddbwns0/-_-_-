import { Module } from '@nestjs/common';
import { MongooseModule, Schema } from '@nestjs/mongoose';
import { Users, UserSchema } from 'src/schema/user.schema';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Roles, RoleSchema } from 'src/schema/role.schema';
import {
  FriendInviteLog,
  FriendInviteLogSchema,
} from 'src/schema/friendInviteLog';
import { userCounterSchema } from 'src/schema/user_counter.shema';
import { RolesGuard } from 'src/guard/auth.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Users.name, schema: UserSchema },
      { name: Roles.name, schema: RoleSchema },
      { name: FriendInviteLog.name, schema: FriendInviteLogSchema },
      { name: 'userCounter', schema: userCounterSchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtService,
    {
      provide: 'APP_GUARD',
      useClass: RolesGuard,
    },
  ],
  exports: [],
})
export class AuthModule {}
