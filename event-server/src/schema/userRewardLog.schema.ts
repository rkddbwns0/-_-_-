import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type userRewardLogDocument = userRewardLog & Document;
@Schema({ collection: 'userRewardLog' })
export class userRewardLog {
  @Prop({ required: true })
  user_id: number;

  @Prop({ required: true })
  event_no: number;

  @Prop({ required: true, default: false })
  reward_given: Boolean;

  @Prop({ required: true, default: Date.now })
  created_at: Date;
}

export const userRewardLogSchema = SchemaFactory.createForClass(userRewardLog);
