import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type UserEventLogDocument = UserEventLog & Document;
@Schema({ collection: 'userEventLog' })
export class UserEventLog {
  @Prop({ required: true })
  user_id: string;

  @Prop({ required: true })
  event_no: number;

  @Prop({ required: true })
  event_type: string;

  @Prop({ required: true, type: Object })
  data: Record<string, any>;

  @Prop({ required: true, default: false })
  state: boolean;

  @Prop({ required: true, default: Date.now })
  created_at: Date;
}

export const UserEventLogSchema = SchemaFactory.createForClass(UserEventLog);
