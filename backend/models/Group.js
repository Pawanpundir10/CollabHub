import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const GroupSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  projectName: { type: String, required: true },
  supervisorName: { type: String, required: true },
  skillsRequired: [{ type: String }],
  skillsNeeded: [{ type: String }],
  projectOutcomes: { type: String },
  outcomeType: { 
    type: String, 
    enum: ['Research Paper', 'Review Paper', 'Patent', 'Product'],
    default: 'Product' 
  },
  maxMembers: { type: Number, default: 5 },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

export default model('Group', GroupSchema);
