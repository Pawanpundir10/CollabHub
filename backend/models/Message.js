import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const MessageSchema = new Schema({
  group: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  isEdited: { type: Boolean, default: false },
}, { timestamps: true });

export default model('Message', MessageSchema);
