import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { GatewayStategy } from './gateway.passport';
import { MongooseModule } from '@nestjs/mongoose';
import { Users, UserSchema } from 'src/schema/user.schema';
import { GatewayGuadrd } from './gateway.guard';
import { GatewayController } from './gateway.controller';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
    MongooseModule.forFeature([{ name: Users.name, schema: UserSchema }]),
  ],
  providers: [
    GatewayStategy,
    {
      provide: 'APP_GUARD',
      useClass: GatewayGuadrd,
    },
  ],
  controllers: [GatewayController],
  exports: [PassportModule, JwtModule],
})
export class GatewayModule {}
