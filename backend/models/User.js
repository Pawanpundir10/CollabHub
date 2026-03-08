import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  avatarUrl: { type: String, default: '' },
  
  // Authentication & Verification
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String, default: null },
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpiresAt: { type: Date, default: null },
}, { timestamps: true });

export default model('User', UserSchema);
