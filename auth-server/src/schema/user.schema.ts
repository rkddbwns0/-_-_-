import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type UserDocument = Users & Document;

export enum Role {
  USER = 'user',
  OPERATOR = 'operator',
  AUDITOR = 'auditor',
  ADMIN = 'admin',
}
@Schema({ collection: 'users' })
export class Users {
  @Prop({ required: true, unique: true })
  user_id: number;

  @Prop({ required: true, unique: true, sparse: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  name: string;

  @Prop({
    required: true,
    default: Role.USER,
    enum: ['user', 'admin', 'operator', 'auditor'],
  })
  role: Role;

  @Prop({ required: false, default: null })
  refresh_token: string;

  @Prop({ required: true, default: null })
  code: string;

  @Prop({ required: false, default: null })
  login_at: Date;
}

export const UserSchema = SchemaFactory.createForClass(Users);
