import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'doctor', 'admin'],
    default: 'user'
  },
  department: {
    type: String,
    required: function() {
      return this.role === 'doctor';
    }
  },
  phone: String,
  specialization: String,
  bio: {
    type: String,
    default: null
  },
  notes: [String],
  photo: {
    type: String,
    default: null
  },
  rating: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.model('User', userSchema); 