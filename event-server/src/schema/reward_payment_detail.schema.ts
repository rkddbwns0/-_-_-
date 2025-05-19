import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type RewardPaymentDetailDocument = RewardPaymentDetail & Document;
@Schema({ collection: 'reward_payment_detail' })
export class RewardPaymentDetail {
  @Prop({ required: true })
  user_id: number;

  @Prop({ required: true })
  event_no: number;

  @Prop({ required: true })
  reward_no: number;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true, default: Date.now })
  payment_at: Date;
}

export const RewardPaymentDetailSchema =
  SchemaFactory.createForClass(RewardPaymentDetail);
