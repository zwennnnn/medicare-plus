import User from '../models/userModel.js';
import Appointment from '../models/appointmentModel.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cloudinary from '../config/cloudinaryConfig.js';
import { Readable } from 'stream';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Doktor istatistiklerini getir
export const getDoctorStats = async (req, res) => {
  try {
    const doctorId = req.user.userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Bugünkü randevular
    const todayAppointments = await Appointment.countDocuments({
      doctorId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    // Toplam benzersiz hasta sayısı
    const totalPatients = await Appointment.distinct('userId', {
      doctorId
    }).then(patients => patients.length);

    // Tamamlanan randevular
    const completedAppointments = await Appointment.countDocuments({
      doctorId,
      status: 'completed'
    });

    // Bekleyen randevular
    const pendingAppointments = await Appointment.countDocuments({
      doctorId,
      status: 'pending'
    });

    res.json({
      todayAppointments,
      totalPatients,
      completedAppointments,
      pendingAppointments
    });

  } catch (error) {
    console.error('Get Doctor Stats Error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Doktorun randevularını getir
export const getDoctorAppointments = async (req, res) => {
  try {
    console.log('Getting appointments for doctor:', req.user.userId);
    const { status } = req.query;
    const query = { doctorId: req.user.userId };
    
    if (status && status !== 'all') {
      query.status = status;
    }

    console.log('Query:', query);

    const appointments = await Appointment.find(query)
      .populate('userId', 'name email')
      .populate('doctorId', 'name department')
      .sort({ date: 1, time: 1 });

    console.log('Found appointments:', appointments);
    res.json(appointments);
  } catch (error) {
    console.error('Get Doctor Appointments Error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Randevu durumunu güncelle
export const updateAppointmentStatus = async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, doctorId: req.user.userId },
      { status: req.body.status },
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
};

// Doktor profilini getir
export const getDoctorProfile = async (req, res) => {
  try {
    const doctor = await User.findById(req.user.userId)
      .select('name email phone department specialization bio photo');
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doktor bulunamadı' });
    }

    res.json(doctor);
  } catch (error) {
    console.error('Get Doctor Profile Error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Doktor profilini güncelle
export const updateDoctorProfile = async (req, res) => {
  try {
    const updates = req.body;
    const doctor = await User.findById(req.user.userId);

    if (!doctor) {
      return res.status(404).json({ message: 'Doktor bulunamadı' });
    }

    // Eğer base64 formatında fotoğraf geldiyse
    if (updates.photo && updates.photo.startsWith('data:image')) {
      try {
        // Eski fotoğrafı Cloudinary'den sil
        if (doctor.photo && doctor.photo.includes('cloudinary')) {
          const publicId = doctor.photo.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(publicId);
        }

        // Yeni fotoğrafı Cloudinary'ye yükle
        const result = await cloudinary.uploader.upload(updates.photo, {
          folder: 'doctor-profiles',
          transformation: [
            { width: 128, height: 128, crop: "fill", radius: "max" },
            { quality: "auto" }
          ]
        });

        // Yeni fotoğraf URL'ini kaydet
        updates.photo = result.secure_url;
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({ message: 'Fotoğraf yüklenemedi' });
      }
    }

    // Güvenli alanları güncelle
    const allowedUpdates = ['name', 'phone', 'department', 'bio', 'photo'];
    allowedUpdates.forEach(update => {
      if (updates[update] !== undefined) {
        doctor[update] = updates[update];
      }
    });

    await doctor.save();
    res.json(doctor);
  } catch (error) {
    console.error('Update Doctor Profile Error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Doktorun hastalarını getir
export const getDoctorPatients = async (req, res) => {
  try {
    const doctorId = req.user.userId;

    // Önce tüm tamamlanmış randevuları al ve hasta bazında grupla
    const patients = await Appointment.aggregate([
      { 
        $match: { 
          doctorId: new mongoose.Types.ObjectId(doctorId),
          status: 'completed'
        } 
      },
      {
        $group: {
          _id: '$userId',
          lastVisit: { $max: '$date' }, // Son randevu tarihi
          visitCount: { $sum: 1 } // Toplam randevu sayısı
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'patientInfo'
        }
      },
      { $unwind: '$patientInfo' },
      {
        $project: {
          _id: 1,
          name: '$patientInfo.name',
          email: '$patientInfo.email',
          phone: '$patientInfo.phone',
          lastVisit: 1,
          visitCount: 1
        }
      },
      { $sort: { lastVisit: -1 } } // En son ziyaret edenleri başa al
    ]);

    res.json(patients);
  } catch (error) {
    console.error('Get Doctor Patients Error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

const fetchDepartmentInfo = async (department) => {
  try {
    const response = await fetch(`http://localhost:5000/api/users/doctors/by-department?department=${department}`);
    if (response.ok) {
      const doctors = await response.json();
      return doctors.map(doc => `Dr. ${doc.name} (${doc.department})`).join('\n');
    }
    return 'Bu departman için bilgi bulunamadı.';
  } catch (error) {
    return 'Bilgiler alınırken bir hata oluştu.';
  }
};

// Tüm doktorları getir (Home sayfası için)
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ 
      role: 'doctor',
      photo: { $ne: null } // Sadece fotoğrafı olan doktorları getir
    })
    .select('name department bio photo')
    .sort('-createdAt')
    .limit(6); // Sadece ilk 6 doktoru getir

    res.json(doctors);
  } catch (error) {
    console.error('Get All Doctors Error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
}; 