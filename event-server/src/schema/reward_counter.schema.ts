import { Schema } from 'mongoose';

export const RewardCounterSchema = new Schema({
  _id: String,
  seq: { type: Number, default: 0 },
});
