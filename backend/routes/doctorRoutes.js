import express from 'express';
import auth from '../middleware/auth.js';
import { isDoctor } from '../middleware/roleCheck.js';
import {
  getDoctorStats,
  getDoctorAppointments,
  updateAppointmentStatus,
  getDoctorProfile,
  updateDoctorProfile,
  getDoctorPatients
} from '../controllers/doctorController.js';
import cloudinary from '../config/cloudinaryConfig.js';
import User from '../models/userModel.js';
import bcrypt from 'bcrypt';

const router = express.Router();

// Debug middleware
router.use((req, res, next) => {
  console.log(`Doctor Route: ${req.method} ${req.url}`);
  next();
});

// İstatistikler
router.get('/stats', auth, isDoctor, getDoctorStats);

// Randevular
router.get('/appointments', auth, isDoctor, getDoctorAppointments);
router.patch('/appointments/:id/status', auth, isDoctor, updateAppointmentStatus);

// Hastalar
router.get('/patients', auth, isDoctor, getDoctorPatients);

// Profil
router.get('/profile', auth, isDoctor, async (req, res) => {
  try {
    const doctor = await User.findById(req.user.userId).select('-password');
    if (!doctor) {
      return res.status(404).json({ message: 'Doktor bulunamadı' });
    }
    res.json(doctor);
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Profil bilgilerini güncelle
router.put('/profile', auth, isDoctor, async (req, res) => {
  try {
    const { name, email, bio, currentPassword, newPassword } = req.body;
    const doctor = await User.findById(req.user.userId);

    if (!doctor) {
      return res.status(404).json({ message: 'Doktor bulunamadı' });
    }

    // Email değişiyorsa, yeni email'in kullanımda olup olmadığını kontrol et
    if (email !== doctor.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: doctor._id } });
      if (emailExists) {
        return res.status(400).json({ message: 'Bu email zaten kullanımda' });
      }
    }

    // Şifre veya email değişiyorsa mevcut şifreyi kontrol et
    if ((email !== doctor.email || newPassword) && currentPassword) {
      const isMatch = await bcrypt.compare(currentPassword, doctor.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Mevcut şifre yanlış' });
      }
    }

    // Bilgileri güncelle
    doctor.name = name;
    doctor.email = email;
    doctor.bio = bio;

    // Yeni şifre varsa güncelle
    if (newPassword) {
      const salt = await bcrypt.genSalt(10);
      doctor.password = await bcrypt.hash(newPassword, salt);
    }

    await doctor.save();

    // Güncellenmiş doktor bilgilerini döndür (şifre hariç)
    const updatedDoctor = await User.findById(doctor._id).select('-password');
    res.json(updatedDoctor);

  } catch (error) {
    console.error('Update Profile Error:', error);
    if (error.code === 11000) { // MongoDB duplicate key error
      return res.status(400).json({ message: 'Bu email zaten kullanımda' });
    }
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Profil fotoğrafı yükleme endpoint'i
router.post('/profile/photo', auth, isDoctor, async (req, res) => {
  try {
    if (!req.body.photo) {
      return res.status(400).json({ message: 'Fotoğraf verisi gerekli' });
    }

    const result = await cloudinary.uploader.upload(req.body.photo, {
      folder: 'doctor-profiles',
      transformation: [
        { width: 128, height: 128, crop: "fill" },
        { quality: "auto" }
      ]
    });

    const updatedDoctor = await User.findByIdAndUpdate(
      req.user.userId,
      { photo: result.secure_url },
      { new: true }
    ).select('-password');

    res.status(200).json({
      message: 'Profil fotoğrafı başarıyla güncellendi',
      user: updatedDoctor
    });

  } catch (error) {
    console.error('Fotoğraf yükleme hatası:', error);
    res.status(500).json({ message: 'Fotoğraf yüklenirken bir hata oluştu' });
  }
});

export default router; 