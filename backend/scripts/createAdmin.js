import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../models/userModel.js';
import dotenv from 'dotenv';

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const adminData = {
      name: 'Admin',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin'
    };

    const salt = await bcrypt.genSalt(10);
    adminData.password = await bcrypt.hash(adminData.password, salt);

    const admin = new User(adminData);
    await admin.save();

    console.log('Admin kullanıcısı oluşturuldu');
    process.exit(0);
  } catch (error) {
    console.error('Hata:', error);
    process.exit(1);
  }
};

createAdmin(); 