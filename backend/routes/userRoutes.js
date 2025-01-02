import express from 'express';
import User from '../models/userModel.js';
import auth from '../middleware/auth.js';
import bcrypt from 'bcrypt';
import { 
  getDoctorsWithStats,
  addReview,
  getDoctorReviews,
  getUserReviews,
  updateReview,
  deleteReview
} from '../controllers/userController.js';
import Review from '../models/reviewModel.js';
import Appointment from '../models/appointmentModel.js';

const router = express.Router();

// Diğer routes
router.get('/doctors/featured', getDoctorsWithStats);
router.get('/doctors/by-department', async (req, res) => {
  try {
    const { department } = req.query;
    const doctors = await User.find({ 
      role: 'doctor',
      department: department 
    }).select('name department');
    res.json(doctors);
  } catch (error) {
    console.error('Get Doctors Error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Kullanıcı bilgilerini getir - bunu en sona alıyoruz
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get User Error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Profil güncelleme
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Email veya şifre değişiyorsa, mevcut şifreyi kontrol et
    if (email !== user.email || newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Mevcut şifre gerekli' });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Mevcut şifre yanlış' });
      }
    }

    // Email değişiyorsa, yeni email'in kullanımda olup olmadığını kontrol et
    if (email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Bu email zaten kullanımda' });
      }
    }

    user.name = name;
    user.email = email;

    if (newPassword) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();
    res.json({ message: 'Profil güncellendi' });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Doktorun tüm yorumlarını getir
router.get('/doctors/:id/reviews', async (req, res) => {
  try {
    const doctorId = req.params.id;

    const reviews = await Review.find({ doctorId })
      .populate('userId', 'name')
      .populate('doctorId', 'name department')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error('Get Doctor Reviews Error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Yorum ekle
router.post('/doctors/:id/reviews', auth, async (req, res) => {
  try {
    const doctorId = req.params.id;
    const { rating, comment, appointmentId } = req.body;

    // Doktoru kontrol et
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ message: 'Doktor bulunamadı' });
    }

    // Randevuyu kontrol et
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Randevu bulunamadı' });
    }

    // Yetki kontrolü
    if (appointment.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }

    // Önceki yorum kontrolü
    const existingReview = await Review.findOne({ appointmentId });
    if (existingReview) {
      return res.status(400).json({ message: 'Bu randevuya zaten yorum yapılmış' });
    }

    // Yeni yorum oluştur
    const review = new Review({
      userId: req.user.userId,
      doctorId,
      appointmentId,
      rating: Number(rating),
      comment: comment.trim()
    });

    await review.save();

    // Randevuyu güncelle
    appointment.hasReview = true;
    appointment.review = review._id;
    await appointment.save();

    // Doktorun ortalama puanını güncelle
    const allReviews = await Review.find({ doctorId });
    const averageRating = allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length;
    
    await User.findByIdAndUpdate(
      doctorId,
      { $set: { rating: Number(averageRating.toFixed(1)) } }
    );

    // Populate edilmiş yorumu döndür
    const populatedReview = await Review.findById(review._id)
      .populate('userId', 'name')
      .populate('doctorId', 'name department');

    res.status(201).json({
      success: true,
      message: 'Yorum başarıyla eklendi',
      review: populatedReview
    });
  } catch (error) {
    console.error('Add Review Error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Yorumu güncelle
router.put('/doctors/reviews/:id', auth, async (req, res) => {
  try {
    const reviewId = req.params.id;
    const { rating, comment } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Yorum bulunamadı' });
    }

    // Yetki kontrolü
    if (review.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }

    // Yorumu güncelle
    review.rating = Number(rating);
    review.comment = comment.trim();
    review.isEdited = true;
    await review.save();

    // Doktorun ortalama puanını güncelle
    const allReviews = await Review.find({ doctorId: review.doctorId });
    const averageRating = allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length;
    
    await User.findByIdAndUpdate(
      review.doctorId,
      { $set: { rating: Number(averageRating.toFixed(1)) } }
    );

    // Populate edilmiş yorumu döndür
    const populatedReview = await Review.findById(review._id)
      .populate('userId', 'name')
      .populate('doctorId', 'name department');

    res.json({
      success: true,
      message: 'Yorum başarıyla güncellendi',
      review: populatedReview
    });
  } catch (error) {
    console.error('Update Review Error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Yorumu sil
router.delete('/doctors/reviews/:id', auth, async (req, res) => {
  try {
    const reviewId = req.params.id;
    console.log('Silinecek yorum ID:', reviewId);

    const review = await Review.findById(reviewId);
    console.log('Bulunan yorum:', review);

    if (!review) {
      return res.status(404).json({ message: 'Yorum bulunamadı' });
    }

    // Yetki kontrolü
    if (review.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }

    // Önce randevuyu güncelle
    await Appointment.findByIdAndUpdate(review.appointmentId, {
      $set: { hasReview: false, review: null }
    });

    // Yorumu sil
    await Review.findByIdAndDelete(reviewId);

    // Doktorun ortalama puanını güncelle
    const allReviews = await Review.find({ doctorId: review.doctorId });
    const averageRating = allReviews.length > 0
      ? allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length
      : 0;
    
    await User.findByIdAndUpdate(
      review.doctorId,
      { $set: { rating: Number(averageRating.toFixed(1)) } }
    );

    res.json({
      success: true,
      message: 'Yorum başarıyla silindi'
    });
  } catch (error) {
    console.error('Delete Review Error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Son yorumları getir
router.get('/reviews/latest', async (req, res) => {
  try {
    console.log('Son yorumlar istendi');
    const reviews = await Review.find()
      .populate('userId', 'name')
      .populate('doctorId', 'name department')
      .sort({ createdAt: -1 })
      .limit(6);

    console.log('Bulunan yorumlar:', reviews);
    res.json(reviews);
  } catch (error) {
    console.error('Get Latest Reviews Error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

export default router;