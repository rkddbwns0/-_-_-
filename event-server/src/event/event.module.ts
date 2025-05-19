import { Module } from '@nestjs/common';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Event, EventSchema } from 'src/schema/event.schema';
import { Reward, RewardSchema } from 'src/schema/reward.schema';
import { Roles, RoleSchema } from 'src/schema/role.schema';
import { RoleGuard } from 'src/role/role.guard';
import { CounterSchema } from 'src/schema/event_counter.schema';
import { JwtModule, JwtService } from '@nestjs/jwt';
import {
  UserEventLog,
  UserEventLogSchema,
} from 'src/schema/userEventLog.schema';
import {
  userRewardLog,
  userRewardLogSchema,
} from 'src/schema/userRewardLog.schema';
import { Users, UserSchema } from 'src/schema/user.schema';
import {
  FriendInviteLog,
  FriendInviteLogSchema,
} from 'src/schema/friendInviteLog';
import { RewardLog, RewardLogSchema } from 'src/schema/rewardLog.schema';
import {
  RewardPaymentDetail,
  RewardPaymentDetailSchema,
} from 'src/schema/reward_payment_detail.schema';
import { EventScheduler } from './event.scheduler';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema },
      { name: Reward.name, schema: RewardSchema },
      { name: Roles.name, schema: RoleSchema },
      { name: 'EventCounter', schema: CounterSchema },
      { name: 'RewardCounter', schema: CounterSchema },
      { name: UserEventLog.name, schema: UserEventLogSchema },
      { name: userRewardLog.name, schema: userRewardLogSchema },
      { name: Users.name, schema: UserSchema },
      { name: FriendInviteLog.name, schema: FriendInviteLogSchema },
      { name: RewardLog.name, schema: RewardLogSchema },
      { name: RewardPaymentDetail.name, schema: RewardPaymentDetailSchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
  ],
  controllers: [EventController],
  providers: [EventService, RoleGuard, JwtService, EventScheduler],
  exports: [],
})
export class EventModule {}
