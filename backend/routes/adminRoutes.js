import express from 'express';
import User from '../models/userModel.js';
import Appointment from '../models/appointmentModel.js';
import auth from '../middleware/auth.js';
import bcrypt from 'bcrypt';

const router = express.Router();

// Admin middleware
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Tüm doktorları getir
router.get('/doctors', auth, isAdmin, async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' }).select('-password');
    res.json(doctors);
  } catch (error) {
    console.error('Get Doctors Error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Departmana göre doktorları getir
router.get('/doctors/by-department', auth, isAdmin, async (req, res) => {
  try {
    const { department } = req.query;
    const doctors = await User.find({ 
      role: 'doctor',
      department: department 
    }).select('-password');
    res.json(doctors);
  } catch (error) {
    console.error('Get Doctors By Department Error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Admin stats
router.get('/stats', auth, isAdmin, async (req, res) => {
  try {
    // İstatistikleri getir
    const [totalDoctors, totalUsers, totalAppointments] = await Promise.all([
      User.countDocuments({ role: 'doctor' }),
      User.countDocuments({ role: 'user' }),
      Appointment.countDocuments()
    ]);

    // Son randevuları getir
    const recentAppointments = await Appointment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'name')
      .populate('doctorId', 'name');

    // Departmanlara göre doktor sayılarını getir
    const departmentStats = await User.aggregate([
      { $match: { role: 'doctor' } },
      { $group: { _id: '$department', count: { $sum: 1 } } }
    ]);

    res.json({
      totalDoctors,
      totalUsers,
      totalAppointments,
      recentAppointments,
      departmentStats
    });
  } catch (error) {
    console.error('Stats Error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Yeni doktor ekle
router.post('/doctors', auth, isAdmin, async (req, res) => {
  try {
    const { name, email, password, department } = req.body;

    // Email kontrolü
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Bu email zaten kullanımda' });
    }

    // Şifreyi hashle
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Yeni doktor oluştur
    const doctor = new User({
      name,
      email,
      password: hashedPassword,
      department,
      role: 'doctor'
    });

    await doctor.save();
    res.status(201).json({ message: 'Doktor başarıyla eklendi' });
  } catch (error) {
    console.error('Add Doctor Error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Doktor güncelle
router.put('/doctors/:id', auth, isAdmin, async (req, res) => {
  try {
    const { name, email, department } = req.body;
    const doctor = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, department },
      { new: true }
    ).select('-password');

    if (!doctor) {
      return res.status(404).json({ message: 'Doktor bulunamadı' });
    }

    res.json(doctor);
  } catch (error) {
    console.error('Update Doctor Error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Doktor sil
router.delete('/doctors/:id', auth, isAdmin, async (req, res) => {
  try {
    const doctor = await User.findByIdAndDelete(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doktor bulunamadı' });
    }
    res.json({ message: 'Doktor başarıyla silindi' });
  } catch (error) {
    console.error('Delete Doctor Error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Tüm randevuları getir
router.get('/appointments', auth, isAdmin, async (req, res) => {
  try {
    const { status, doctorId } = req.query;
    const query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }

    if (doctorId) {
      query.doctorId = doctorId;
    }

    const appointments = await Appointment.find(query)
      .populate('userId', 'name email')
      .populate('doctorId', 'name department')
      .sort({ date: -1, time: -1 });

    res.json(appointments);
  } catch (error) {
    console.error('Get Appointments Error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Randevu durumunu güncelle
router.patch('/appointments/:id/status', auth, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: 'Randevu bulunamadı' });
    }

    res.json(appointment);
  } catch (error) {
    console.error('Update Appointment Status Error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

export default router; 