import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type RewardLogDocument = RewardLog & Document;
@Schema({ collection: 'rewardLog' })
export class RewardLog {
  @Prop({ required: true, enum: ['중복 보상 요청', '보상 지급', '보상 요청'] })
  type: string;

  @Prop({ required: true, type: Number })
  user_id: number;

  @Prop({ required: false, type: Number })
  admin_id?: number;

  @Prop({ required: true, type: Number })
  event_no: number;

  @Prop()
  request_at?: Date;

  @Prop()
  reward_given_at?: Date;

  @Prop({ type: Object })
  reward_detail?: Record<string, any>;

  @Prop({ required: true })
  message: string;
}

export const RewardLogSchema = SchemaFactory.createForClass(RewardLog);
