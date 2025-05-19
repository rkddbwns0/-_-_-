import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export type EventDocument = Event & Document;
@Schema({ collection: 'event' })
export class Event {
  @Prop({ required: true, unique: true })
  event_no: number;

  @Prop({ required: true })
  classification: string;

  @Prop({ required: true })
  title: string;

  @Prop({})
  content: string;

  @Prop({ type: Object, required: true, default: {} })
  condition: Record<string, any>;

  @Prop({ required: true, default: false })
  state: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Reward', required: true })
  reward: Types.ObjectId;

  @Prop({ required: true, default: Date.now })
  start_at: Date;

  @Prop({ required: true })
  end_at: Date;
}

export const EventSchema = SchemaFactory.createForClass(Event);
