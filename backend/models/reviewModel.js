import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true
  },
  isEdited: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

reviewSchema.index({ appointmentId: 1 }, { unique: true });
reviewSchema.index({ doctorId: 1 });
reviewSchema.index({ userId: 1 });

const Review = mongoose.model('Review', reviewSchema);
export default Review; 