import User from '../models/userModel.js';
import Appointment from '../models/appointmentModel.js';

// Randevu oluştur
export const createAppointment = async (req, res) => {
  try {
    const { doctorId, date, time, complaint } = req.body;

    // Doktoru bul ve departman bilgisini al
    const doctor = await User.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doktor bulunamadı' });
    }

    if (!doctor.department) {
      return res.status(400).json({ message: 'Doktor departman bilgisi eksik' });
    }

    console.log('Creating appointment with department:', doctor.department); // Debug log

    const appointment = await Appointment.create({
      userId: req.user.userId,
      doctorId,
      department: doctor.department,
      date,
      time,
      complaint,
      status: 'pending'
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('userId', 'name')
      .populate('doctorId', 'name department');

    res.status(201).json(populatedAppointment);
  } catch (error) {
    console.error('Create Appointment Error:', error);
    res.status(500).json({ 
      message: 'Randevu oluşturulurken hata oluştu',
      error: error.message 
    });
  }
};

// Randevuları getir
exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.user.id })
      .populate('doctorId', 'name department specialization')
      .sort({ date: 1, time: 1 });
    
    // Doktor bilgilerini kontrol et ve düzenle
    const formattedAppointments = appointments.map(apt => ({
      ...apt._doc,
      doctorId: {
        ...apt.doctorId._doc,
        name: apt.doctorId.name || 'Bilinmiyor'
      }
    }));

    res.json(formattedAppointments);
  } catch (error) {
    console.error('Get Appointments Error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Randevu güncelleme
exports.updateAppointment = async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Randevu bulunamadı' });
    }

    // Yetki kontrolü
    if (req.user.role !== 'admin' && req.user.id !== appointment.doctorId.toString()) {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }

    appointment.status = status;
    await appointment.save();

    res.json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Randevu silme
exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Randevu bulunamadı' });
    }

    // Yetki kontrolü
    if (req.user.role !== 'admin' && req.user.id !== appointment.userId.toString()) {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }

    await appointment.deleteOne();
    res.json({ message: 'Randevu silindi' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
}; 