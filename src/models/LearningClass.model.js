import mongoose from 'mongoose';

const learningClassSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, required: true, trim: true, maxlength: 1200 },
  category: { type: String, required: true, trim: true, maxlength: 80 },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  duration: { type: String, trim: true, maxlength: 60, default: '' },
  videoUrl: { type: String, required: true, trim: true, maxlength: 500 },
  published: { type: Boolean, default: true, index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

learningClassSchema.index({ published: 1, category: 1, createdAt: -1 });
export default mongoose.model('LearningClass', learningClassSchema);
