import {
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreateEventDto {
  @IsNotEmpty()
  @IsNumber()
  event_no: number;

  @IsNotEmpty()
  @IsString()
  classification: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  condition: Record<string, any>;

  @IsNotEmpty()
  @IsBoolean()
  state: boolean = false;

  @IsNotEmpty()
  @IsMongoId()
  reward: Types.ObjectId;

  @IsNotEmpty()
  end_at: string;

  @IsNotEmpty()
  @IsBoolean()
  auto_active: boolean = false;
}

export class CreateRewardDto {
  @IsNotEmpty()
  @IsNumber()
  reward_no: number;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsString()
  detail?: string;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;
}

export class EventParticipationDto {
  @IsNotEmpty()
  partition: boolean;

  @IsNotEmpty()
  @IsString()
  user_id: number;

  @IsNotEmpty()
  @IsString()
  event_no: number;

  @IsNotEmpty()
  @IsString()
  event_type: string;

  @IsNotEmpty()
  data: Record<string, any>;
}

export class ReadRewardLogDto {
  @IsNumber()
  user_id?: number;

  @IsNumber()
  event_no?: number;
}
