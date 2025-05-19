import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type RewardDocument = Reward & Document;

@Schema({ collection: 'reward' })
export class Reward {
  @Prop({ required: true, unique: true })
  reward_no: number;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: false })
  detail: string;

  @Prop({ required: true })
  quantity: number;
}

export const RewardSchema = SchemaFactory.createForClass(Reward);
