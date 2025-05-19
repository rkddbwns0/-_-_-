import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type RoleDocument = Roles & Document;
@Schema({ collection: 'roles' })
export class Roles {
  @Prop({ required: true, unique: true })
  role: string;

  @Prop([String])
  permission: string[];
}

export const RoleSchema = SchemaFactory.createForClass(Roles);
