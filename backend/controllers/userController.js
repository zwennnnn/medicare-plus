import User from '../models/userModel.js';
import Appointment from '../models/appointmentModel.js';
import Review from '../models/reviewModel.js';

// Öne çıkan doktorları ve istatistikleri getir
export const getDoctorsWithStats = async (req, res) => {
  try {
    // Tüm doktorları getir (limit kaldırıldı)
    const doctors = await User.find({ 
      role: 'doctor'
    })
    .select('name department bio photo')
    .sort('-createdAt');  // En yeni doktorlar önce gelsin

    // Her doktor için istatistikleri hesapla
    const doctorsWithStats = await Promise.all(doctors.map(async (doctor) => {
      const completedAppointments = await Appointment.countDocuments({
        doctorId: doctor._id,
        status: 'completed'
      });

      const totalPatients = await Appointment.distinct('userId', {
        doctorId: doctor._id,
        status: 'completed'
      });

      return {
        ...doctor.toObject(),
        completedAppointments,
        totalPatients: totalPatients.length
      };
    }));

    // Toplam doktor sayısını getir
    const totalDoctors = doctors.length; // Gerçek doktor sayısı

    // Toplam hasta sayısını getir
    const totalPatients = await Appointment.distinct('userId', {
      status: 'completed'
    }).then(patients => patients.length);

    res.json({
      doctors: doctorsWithStats,
      stats: {
        totalDoctors,
        totalPatients
      }
    });
  } catch (error) {
    console.error('Get Doctors Error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Yorum ekle
export const addReview = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { rating, comment } = req.body;

    // Randevuyu kontrol et
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      userId: req.user.userId,
      status: 'completed'
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Randevu bulunamadı veya yorum yapılamaz' });
    }

    // Yorum oluştur
    const review = await Review.create({
      userId: req.user.userId,
      doctorId: appointment.doctorId,
      appointmentId,
      rating,
      comment
    });

    // Randevuyu güncelle
    appointment.hasReview = true;
    await appointment.save();

    // Kullanıcı ve doktor bilgileriyle birlikte yorumu döndür
    const populatedReview = await Review.findById(review._id)
      .populate('userId', 'name photo')
      .populate('doctorId', 'name department');

    res.status(201).json(populatedReview);
  } catch (error) {
    console.error('Add Review Error:', error);
    res.status(500).json({ 
      message: 'Yorum eklenirken bir hata oluştu',
      error: error.message 
    });
  }
};

// Doktor yorumlarını getir
export const getDoctorReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('userId', 'name')
      .populate('doctorId', 'name')
      .sort('-createdAt')
      .limit(6);

    console.log('Fetched reviews:', reviews); // Debug için
    res.json(reviews);
  } catch (error) {
    console.error('Get Reviews Error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Kullanıcının kendi yorumlarını getir
export const getUserReviews = async (req, res) => {
  try {
    console.log('Getting reviews for user:', req.user.userId); // Debug için

    const reviews = await Review.find({ userId: req.user.userId })
      .populate('doctorId', 'name department')
      .populate('appointmentId', 'date')
      .sort('-createdAt');

    console.log('Found reviews:', reviews); // Debug için

    if (!reviews) {
      console.log('No reviews found'); // Debug için
      return res.json([]);
    }

    res.json(reviews);
  } catch (error) {
    console.error('Get User Reviews Error:', error);
    res.status(500).json({ 
      message: 'Yorumlar yüklenirken hata oluştu',
      error: error.message 
    });
  }
};

// Yorum güncelle
export const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const review = await Review.findOne({
      _id: req.params.reviewId,
      userId: req.user.userId
    });

    if (!review) {
      return res.status(404).json({ message: 'Yorum bulunamadı' });
    }

    review.rating = rating;
    review.comment = comment;
    review.isEdited = true;
    await review.save();

    const updatedReview = await Review.findById(review._id)
      .populate('doctorId', 'name department')
      .populate('appointmentId', 'date');

    res.json(updatedReview);
  } catch (error) {
    console.error('Update Review Error:', error);
    res.status(500).json({ message: 'Yorum güncellenirken hata oluştu' });
  }
};

// Yorum sil
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findOne({
      _id: req.params.reviewId,
      userId: req.user.userId
    });

    if (!review) {
      return res.status(404).json({ message: 'Yorum bulunamadı' });
    }

    // Randevunun hasReview değerini false yap
    await Appointment.findByIdAndUpdate(review.appointmentId, {
      hasReview: false
    });

    await Review.deleteOne({ _id: review._id });
    res.json({ message: 'Yorum başarıyla silindi' });
  } catch (error) {
    console.error('Delete Review Error:', error);
    res.status(500).json({ message: 'Yorum silinirken hata oluştu' });
  }
}; 