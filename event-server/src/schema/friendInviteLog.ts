import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type FriendInviteLogDocument = FriendInviteLog & Document;
@Schema({ collection: 'friendInviteLog' })
export class FriendInviteLog {
  @Prop({ required: true })
  invite_user_id: number;

  @Prop({ required: true })
  code: string;

  @Prop({ required: true, default: Date.now })
  created_at: Date;
}

export const FriendInviteLogSchema =
  SchemaFactory.createForClass(FriendInviteLog);
