import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const JoinRequestSchema = new Schema({
  group: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending','accepted','rejected'], default: 'pending' },
}, { timestamps: true });

export default model('JoinRequest', JoinRequestSchema);
