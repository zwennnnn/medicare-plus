import express from 'express';
import Appointment from '../models/appointmentModel.js';
import auth from '../middleware/auth.js';
import User from '../models/userModel.js';

const router = express.Router();

// Kullanıcının kendi randevularını getir
router.get('/my-appointments', auth, async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.user.userId })
      .populate('doctorId', 'name department rating')
      .populate('review')
      .sort({ date: -1, time: -1 });
    res.json(appointments);
  } catch (error) {
    console.error('Get My Appointments Error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Randevu iptal et
router.delete('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Randevu bulunamadı' });
    }

    if (appointment.status !== 'pending') {
      return res.status(400).json({ message: 'Bu randevu iptal edilemez' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({ message: 'Randevu iptal edildi' });
  } catch (error) {
    console.error('Cancel Appointment Error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Müsait saatleri getir
router.get('/available-hours', auth, async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    
    // O gün için mevcut randevuları getir
    const existingAppointments = await Appointment.find({
      doctorId,
      date,
      status: { $ne: 'cancelled' } // İptal edilmemiş randevular
    }).select('time');

    // Dolu saatler
    const bookedHours = existingAppointments.map(apt => apt.time);

    // Çalışma saatleri (09:00 - 17:00)
    const workHours = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
    ];

    // Müsait saatler (dolu olmayanlar)
    const availableHours = workHours.filter(hour => !bookedHours.includes(hour));

    res.json(availableHours);
  } catch (error) {
    console.error('Get Available Hours Error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Randevu oluştur
router.post('/', auth, async (req, res) => {
  try {
    const { doctorId, department, date, time, description } = req.body;

    // Tarih kontrolü
    const appointmentDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (appointmentDate < today) {
      return res.status(400).json({ message: 'Geçmiş bir tarihe randevu alamazsınız' });
    }

    // Doktoru bul ve bölümünü al
    const doctor = await User.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doktor bulunamadı' });
    }

    // Aynı doktor, tarih ve saatte başka randevu var mı kontrolü
    const existingAppointment = await Appointment.findOne({
      doctorId,
      date,
      time,
      status: { $ne: 'cancelled' }
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'Bu tarih ve saatte randevu dolu' });
    }

    // Kullanıcının aynı gün için başka randevusu var mı kontrolü
    const userAppointmentSameDay = await Appointment.findOne({
      userId: req.user.userId,
      date,
      status: { $ne: 'cancelled' }
    });

    if (userAppointmentSameDay) {
      return res.status(400).json({ message: 'Aynı gün için zaten bir randevunuz var' });
    }

    // Yeni randevu oluştur
    const appointment = new Appointment({
      userId: req.user.userId,
      doctorId,
      department: doctor.department, // Doktorun bölümünü kullan
      date,
      time,
      complaint: description,
      status: 'pending' // Default status
    });

    await appointment.save();

    // Populate edilmiş randevuyu geri döndür
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('doctorId', 'name department')
      .populate('userId', 'name');

    res.status(201).json({
      message: 'Randevu başarıyla oluşturuldu',
      appointment: populatedAppointment
    });
  } catch (error) {
    console.error('Create Appointment Error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Randevu iptal etme
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { cancellationReason } = req.body;
    
    const appointment = await Appointment.findById(id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Randevu bulunamadı' });
    }
    
    // Sadece kendi randevusunu iptal edebilir
    if (appointment.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }
    
    // Sadece bekleyen randevular iptal edilebilir
    if (appointment.status !== 'pending') {
      return res.status(400).json({ message: 'Bu randevu iptal edilemez' });
    }
    
    appointment.status = 'cancelled';
    appointment.cancellationReason = cancellationReason;
    await appointment.save();
    
    res.json({ message: 'Randevu iptal edildi' });
  } catch (error) {
    console.error('Cancel Appointment Error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Randevu onaylama
router.put('/:id/confirm', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const appointment = await Appointment.findById(id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Randevu bulunamadı' });
    }
    
    // Sadece doktor kendi randevularını onaylayabilir
    if (appointment.doctorId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }
    
    // Sadece bekleyen randevular onaylanabilir
    if (appointment.status !== 'pending') {
      return res.status(400).json({ message: 'Bu randevu onaylanamaz' });
    }
    
    // Durumu tamamlandı olarak güncelle
    appointment.status = 'completed';
    await appointment.save();
    
    res.json({ 
      success: true,
      message: 'Randevu tamamlandı olarak işaretlendi',
      appointment 
    });
  } catch (error) {
    console.error('Confirm Appointment Error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

export default router; 