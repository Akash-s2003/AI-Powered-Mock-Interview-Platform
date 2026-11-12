import mongoose from 'mongoose';

const interviewQuestionSchema = new mongoose.Schema({
  role: { type: String, required: true, trim: true, lowercase: true, index: true },
  difficulty: { type: String, enum: ['all', 'easy', 'medium', 'hard'], default: 'medium', index: true },
  type: { type: String, enum: ['behavioral', 'technical', 'coding'], default: 'technical' },
  text: { type: String, required: true, trim: true, maxlength: 1600 },
  codeType: { type: String, enum: ['write', 'fix', 'explain'], default: 'write' },
  codeLanguage: { type: String, trim: true, maxlength: 40, default: 'javascript' },
  codeSnippet: { type: String, trim: true, maxlength: 8000, default: '' },
  isActive: { type: Boolean, default: true, index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

interviewQuestionSchema.index({ role: 1, difficulty: 1, isActive: 1 });
export default mongoose.model('InterviewQuestion', interviewQuestionSchema);
