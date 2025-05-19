import { Schema } from 'mongoose';

export const userCounterSchema = new Schema({
  _id: String,
  seq: { type: Number, default: 0 },
});
